import { editDistance, normalize, stem, STOP_WORDS } from './text';

/** One searchable record: weighted text fields (a product name counts more than its description). */
export interface SearchDoc {
  id: string;
  fields: { text: string; weight: number }[];
  /** Whole-phrase forms (normalised) that earn a bonus when the question contains them, e.g. the product name. */
  phrases?: { text: string; bonus: number }[];
}

export interface SearchHit {
  id: string;
  score: number;
  /** Share of the question's search words this record matched (0–1). */
  coverage: number;
}

interface Posting {
  doc: number;
  tf: number;
}

/**
 * Small BM25 index over weighted fields, built in the browser in a few milliseconds for ~700 products.
 * Search words are normalised and stemmed with the same rules as the catalogue text.
 */
export class SearchIndex {
  private readonly postings = new Map<string, Posting[]>();
  private readonly lengths: number[] = [];
  private readonly docs: SearchDoc[];
  private readonly avgLength: number;
  private readonly k1 = 1.2;
  private readonly b = 0.45;

  constructor(docs: SearchDoc[]) {
    this.docs = docs;
    docs.forEach((doc, i) => {
      const tf = new Map<string, number>();
      let length = 0;
      for (const field of doc.fields) {
        for (const word of normalize(field.text).split(' ')) {
          if (!word || STOP_WORDS.has(word)) continue;
          const term = stem(word);
          tf.set(term, (tf.get(term) ?? 0) + field.weight);
          length += field.weight;
        }
      }
      this.lengths[i] = length;
      for (const [term, f] of tf) {
        const list = this.postings.get(term) ?? [];
        list.push({ doc: i, tf: f });
        this.postings.set(term, list);
      }
    });
    this.avgLength = this.lengths.reduce((a, n) => a + n, 0) / Math.max(1, docs.length);
  }

  /** Every indexed word, for spelling correction. */
  get vocabulary(): Map<string, number> {
    const v = new Map<string, number>();
    for (const [term, list] of this.postings) v.set(term, list.length);
    return v;
  }

  has(term: string): boolean {
    return this.postings.has(term);
  }

  private idf(term: string): number {
    const n = this.postings.get(term)?.length ?? 0;
    return Math.log(1 + (this.docs.length - n + 0.5) / (n + 0.5));
  }

  /**
   * @param terms   stemmed search words (weight 1)
   * @param extra   lower-weight related words (e.g. "wrench" when the question says "spanner")
   * @param phrase  the normalised question (or several forms of it), for whole-phrase bonuses
   */
  search(terms: string[], extra: string[] = [], phrase: string | string[] = '', limit = 12): SearchHit[] {
    const scores = new Map<number, number>();
    const matched = new Map<number, Set<string>>();
    const weighted: [string, number][] = [
      ...[...new Set(terms)].map((t) => [t, 1] as [string, number]),
      ...[...new Set(extra)].filter((t) => !terms.includes(t)).map((t) => [t, 0.35] as [string, number]),
    ];
    for (const [term, weight] of weighted) {
      const list = this.postings.get(term);
      if (!list) continue;
      const idf = this.idf(term);
      for (const { doc, tf } of list) {
        const norm = tf + this.k1 * (1 - this.b + (this.b * this.lengths[doc]) / this.avgLength);
        scores.set(doc, (scores.get(doc) ?? 0) + weight * idf * ((tf * (this.k1 + 1)) / norm));
        if (weight === 1) {
          const set = matched.get(doc) ?? new Set<string>();
          set.add(term);
          matched.set(doc, set);
        }
      }
    }
    const phrases = (Array.isArray(phrase) ? phrase : [phrase]).filter(Boolean).map((x) => ` ${x} `);
    if (phrases.length) {
      for (const [doc, score] of scores) {
        let bonus = 0;
        for (const p of this.docs[doc].phrases ?? []) {
          if (p.text && phrases.some((x) => x.includes(` ${p.text} `))) bonus += p.bonus;
        }
        if (bonus) scores.set(doc, score + bonus);
      }
    }
    // Very common words ("steel", "heavy") don't count against coverage when missing — they barely identify anything.
    const common = (t: string) => (this.postings.get(t)?.length ?? 0) / this.docs.length > 0.06;
    const needed = new Set(terms.filter((t) => !common(t)));
    const distinct = needed.size || new Set(terms).size || 1;
    return [...scores.entries()]
      .map(([doc, score]) => {
        const hit = matched.get(doc) ?? new Set<string>();
        const coverage = Math.min(1, (needed.size ? [...needed].filter((t) => hit.has(t)).length : hit.size) / distinct);
        // Records that match every search word rank above ones that match a long phrase but miss a word.
        return { id: this.docs[doc].id, score: score * (0.6 + 0.4 * coverage), coverage };
      })
      .sort((a, b) => b.score - a.score || b.coverage - a.coverage)
      .slice(0, limit);
  }
}

/**
 * Corrects a misspelt search word to the closest indexed word (1 edit for short words, 2 for long ones),
 * preferring the more common word. Codes and numbers are never changed.
 */
export function correctWord(word: string, vocabulary: Map<string, number>): string {
  if (word.length < 4 || /\d/.test(word) || vocabulary.has(word)) return word;
  // One typo for ordinary words, two for long ones; the first letter must match (people rarely mistype it).
  const max = word.length >= 8 ? 2 : 1;
  let best = word;
  let bestScore = -1;
  for (const [term, df] of vocabulary) {
    if (term[0] !== word[0] || Math.abs(term.length - word.length) > max) continue;
    const d = editDistance(word, term, max);
    if (d > max) continue;
    const score = (max - d + 1) * 1000 + df;
    if (score > bestScore) {
      best = term;
      bestScore = score;
    }
  }
  return best;
}
