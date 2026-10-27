/**
 * Text handling shared by Sidekick's training script and the in-browser engine: one normaliser, so a question
 * and the catalogue are reduced to the same words ("ER-32", "er 32" and "ER32" all become "er32").
 */

/** Words that carry no meaning for finding a product (English + common Hinglish fillers). */
export const STOP_WORDS = new Set(
  (
    'a an the and or of for to in on at by with from as is are was be been am do does did can could will would should ' +
    'i me my we our you your it its this that these those there here what which who whom whose when where why how ' +
    'please pls plz kindly tell show give get need want looking look find any some about have has had sir madam ' +
    'hi hello hey ok okay yes no not also very much more most just only than then so if but into out up down ' +
    'kya hai hain ka ki ke ko se mein me chahiye chaiye bhai ji aap apke apka koi wala wali'
  ).split(' '),
);

/** Two-to-five letter prefixes that are glued to the number that follows ("ER-32" → "er32", "BT 40" → "bt40"). */
const CODE_PREFIXES =
  'er|e|bt|iso|mt|sk|cat|hsk|rbt|r|m|hrc|ap|apkt|rp|lnmu|spmg|jt|b|g|din|is|ba|unc|unf|bsw|bsf|bsp|npt|hpw|dssl|ssl';
const GLUE = new RegExp(`\\b(${CODE_PREFIXES})[\\s-]?(\\d+[a-z]?)\\b`, 'g');

/** Phrases written several ways, folded into one form before anything else. */
const FOLDS: [RegExp, string][] = [
  [/\bscrew[\s-]?drivers?\b/g, 'screwdriver'],
  [/\bend[\s-]?mills?\b/g, 'endmill'],
  [/\bball[\s-]?nose\b/g, 'ballnose'],
  [/\bnon[\s-]?sparking\b/g, 'nonsparking'],
  [/\bcent(er|re)s?\b/g, 'centre'],
  [/\baluminum\b/g, 'aluminium'],
  [/\bvises?\b/g, 'vice'],
  [/\bdee\b/g, 'd'],
  [/\bt[\s-]?slot\b/g, 'tslot'],
  [/\bu[\s-]?drills?\b/g, 'udrill'],
  [/\bhss[\s-]e\b/g, 'hsse'],
  [/\bcut[\s-]?off\b/g, 'cutoff'],
  [/\bbi[\s-]?metal\b/g, 'bimetal'],
  [/\bjobbers?\b/g, 'jobber'],
  [/\btwo[\s-]in[\s-]one\b/g, '2in1'],
  [/\bspanners\b/g, 'spanner'],
  [/\bsq\.?\s?dr(ive)?\b/g, 'square drive'],
  [/\bdr\.\s/g, 'drive '],
  [/\b(tonnes?|tons?|tonne)\b/g, 't'],
  [/\b(kgs?|kilos?|kilograms?)\b/g, 'kg'],
  [/\b(inches|inch)\b/g, 'inch'],
  [/\bmillimet(er|re)s?\b/g, 'mm'],
];

/** Lower case, unified symbols, glued codes, folded phrases; keeps "/" and "." inside numbers. */
export function normalize(input: string): string {
  let s = (input ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  s = s
    .replace(/[★☆]/g, '')
    .replace(/[×✕]/g, ' x ')
    .replace(/(\d)\s*(?:"|″|''|”)/g, '$1 inch ')
    .replace(/[ø⌀]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/(\d)\s*(mm|cm|kg|t|inch|in|l|ltr|nos?)\b/g, '$1 $2')
    .replace(/(\d)(?=[a-z]{2,})/g, '$1 ');
  for (const [re, to] of FOLDS) s = s.replace(re, to);
  s = s.replace(GLUE, '$1$2');
  // Keep letters, digits, "/" and "." between digits, and hyphens between letters (e.g. "hsk63a").
  s = s
    .replace(/(\d)\.(\d)/g, '$1§$2')
    .replace(/(\d)\/(\d)/g, '$1¦$2')
    .replace(/[^a-z0-9§¦\s]/g, ' ')
    .replace(/§/g, '.')
    .replace(/¦/g, '/');
  return s.replace(/\s+/g, ' ').trim();
}

/** Light English stemmer: plurals and -ing / -ed endings. Codes and numbers are kept. */
export function stem(word: string): string {
  if (word.length <= 3 || /\d/.test(word)) return word;
  if (/(ss|us|is|ous)$/.test(word)) return word;
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (/(sses|shes|ches|xes|zes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('es') && /(oes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s')) word = word.slice(0, -1);
  // "lifting" → "lift", "cutting" → "cut", "tipped" → "tip", "threaded" → "thread" (same rule for questions and catalogue).
  const m = /^(.{3,}?)(ing|ed)$/.exec(word);
  if (m && word.length >= 6) {
    let base = m[1];
    if (/([b-df-hj-np-tv-z])\1$/.test(base) && !/(ll|ss|zz)$/.test(base)) base = base.slice(0, -1);
    return base;
  }
  return word;
}

/** Normalised, stemmed words without stop words. */
export function tokenize(text: string, keepStop = false): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w && (keepStop || !STOP_WORDS.has(w)))
    .map(stem);
}

/** Optimal-string-alignment edit distance (adjacent swaps count as one), stopping early above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** A size or model mentioned in a question, e.g. "er32", "m10", "1/2 inch", "2 t", "10 mm", "40". */
export interface SizeToken {
  raw: string;
  /** Alphanumeric code like "er32" / "bt40" / "hsk63a", or null for a plain number. */
  code: string | null;
  /** Numeric value (fractions evaluated), or null for pure codes. */
  value: number | null;
  unit: 'mm' | 'inch' | 't' | 'kg' | null;
}

const UNIT_OF: Record<string, SizeToken['unit']> = { mm: 'mm', inch: 'inch', in: 'inch', t: 't', kg: 'kg' };

/** Pulls sizes / models out of a normalised question. */
export function sizeTokens(normalized: string): SizeToken[] {
  const out: SizeToken[] = [];
  const words = normalized.split(' ');
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1] ?? '';
    if (/^[a-z]{1,5}\d+[a-z]?$/.test(w) && !/^(2in1)$/.test(w)) {
      out.push({ raw: w, code: w, value: Number(w.replace(/^[a-z]+/, '').replace(/[a-z]$/, '')), unit: null });
      continue;
    }
    const num = /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(w);
    if (num) {
      const value = num[2] ? Number(num[1]) / Number(num[2]) : Number(num[1]);
      const unit = UNIT_OF[next] ?? null;
      out.push({ raw: num[0] + (unit ? ` ${next}` : ''), code: null, value, unit });
      if (unit) i++;
    }
  }
  return out;
}

/** Joins words naturally: "a, b and c". */
export function listText(items: string[], conj = 'and'): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`;
}
