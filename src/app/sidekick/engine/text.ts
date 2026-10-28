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

// ── Devanagari → Latin letters ─────────────────────────────────────────────────────────────────────────────────
// Customers type Hindi in Devanagari ("दुकान कहाँ है") as well as in English letters ("dukaan kahan hai"). Words the
// Hindi list doesn't know are spelt out the way people type Hinglish, so the same rules (and spelling correction for
// loanwords like "ड्रिल" → "dril" → drill) apply to both.
const DEVA_CONSONANTS: Record<string, string> = {
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'n', च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'n', ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n',
  त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n', प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm', य: 'y', र: 'r', ल: 'l', व: 'v', श: 'sh', ष: 'sh',
  स: 's', ह: 'h', ळ: 'l', क़: 'q', ख़: 'kh', ग़: 'g', ज़: 'z', ड़: 'r', ढ़: 'rh', फ़: 'f', य़: 'y',
};
const DEVA_NUKTA: Record<string, string> = { क: 'q', ख: 'kh', ग: 'g', ज: 'z', ड: 'r', ढ: 'rh', फ: 'f', य: 'y' };
const DEVA_VOWELS: Record<string, string> = { अ: 'a', आ: 'aa', इ: 'i', ई: 'i', उ: 'u', ऊ: 'u', ऋ: 'ri', ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au', ऑ: 'o', ऍ: 'e' };
const DEVA_SIGNS: Record<string, string> = { 'ा': 'aa', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e' };

export const hasDevanagari = (s: string) => /[\u0900-\u097F]/.test(s);

/** Hinglish spellings vary in doubled vowels (dukaan / dukan, maalik / malik, chaahiye / chahiye): compare without them. */
export const looseHinglish = (word: string) => word.replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u');

/** One Devanagari word in Hinglish spelling: "दुकान" → "dukaan", "खुलती" → "khulti", "समय" → "samay". */
export function devanagariToLatin(word: string): string {
  const chars = [...word.normalize('NFC')];
  // Syllables: consonant (+ nukta) with its vowel ("a" = inherent, null = none after a virama), or a bare vowel.
  const units: { c: string; v: string | null; schwa: boolean; nasal: boolean; visarga: boolean }[] = [];
  const last = () => units[units.length - 1];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (DEVA_CONSONANTS[ch] !== undefined) {
      let c = DEVA_CONSONANTS[ch];
      if (chars[i + 1] === '\u093C') {
        c = DEVA_NUKTA[ch] ?? c;
        i++;
      }
      units.push({ c, v: 'a', schwa: true, nasal: false, visarga: false });
    } else if (DEVA_VOWELS[ch] !== undefined) {
      units.push({ c: '', v: DEVA_VOWELS[ch], schwa: false, nasal: false, visarga: false });
    } else if (/[०-९]/.test(ch)) {
      units.push({ c: String('०१२३४५६७८९'.indexOf(ch)), v: null, schwa: false, nasal: false, visarga: false });
    } else if (!units.length) {
      continue;
    } else if (DEVA_SIGNS[ch] !== undefined) {
      Object.assign(last(), { v: DEVA_SIGNS[ch], schwa: false });
    } else if (ch === '\u094D') {
      Object.assign(last(), { v: null, schwa: false }); // virama
    } else if (ch === '\u0902' || ch === '\u0901') {
      last().nasal = true; // anusvara / chandrabindu
    } else if (ch === '\u0903') {
      last().visarga = true;
    }
  }
  // Hindi drops the inherent "a" at the end of a word, and between a vowel and a consonant that has a vowel
  // ("आपकी" → aap-ki, "कितने" → kit-ne), working back from the end of the word.
  if (units.length > 1 && last().schwa) last().v = null;
  for (let i = units.length - 2; i > 0; i--) {
    const u = units[i];
    if (u.schwa && units[i - 1].v && units[i + 1].c && units[i + 1].v) u.v = null;
  }
  return units
    .map((u, i) => {
      const next = units[i + 1]?.c ?? '';
      const nasal = u.nasal ? (/^[pbm]/.test(next) ? 'm' : 'n') : '';
      return u.c + (u.v ?? '') + nasal + (u.visarga ? 'h' : '');
    })
    .join('');
}
