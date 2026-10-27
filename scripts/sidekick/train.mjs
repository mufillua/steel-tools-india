// Sidekick — step 2 of 2: "train" the chatbot once, from the catalogues.
//
//   npm run sidekick:train
//
// Reads
//   • the site's product catalogue (src/app/data — already curated from the supplier PDFs, no prices),
//   • the text of every supplier PDF (scripts/sidekick/pdf-text/*.json, made by extract_pdfs.py),
//   • the tool guide (tool-guide.json) and customer synonyms (synonyms.json),
// and writes public/assets/sidekick/knowledge.json, which the chat loads in the visitor's browser.
// Then it asks Sidekick every question in eval.json and prints how many it answered as expected.
//
// From the PDFs only descriptive sentences are kept: anything with a price, tax/terms wording, contact details,
// the supplier speaking about itself ("we", "our"), or the lifting brochure's maker name is dropped.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(ROOT, 'public/assets/sidekick/knowledge.json');

const load = async (entry) => {
  const out = await build({ entryPoints: [join(ROOT, entry)], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
};

const { ALL_PRODUCTS } = await load('src/app/data/products/index.ts');
const { CATEGORIES } = await load('src/app/data/categories.ts');
const { COMPANY } = await load('src/app/config/company.config.ts');
const { normalize, stem, tokenize } = await load('src/app/sidekick/engine/text.ts');
const { SidekickEngine } = await load('src/app/sidekick/engine/engine.ts');
const json = (f) => JSON.parse(readFileSync(join(HERE, f), 'utf8'));

// ── 1. Tool guide → product type ────────────────────────────────────────────────────────────────────────────
const guideFile = json('tool-guide.json');
const guides = {};
const compiled = guideFile.entries.map((e) => {
  guides[e.id] = { title: e.title, uses: e.uses, how: e.how, ...(e.tips?.length ? { tips: e.tips } : {}) };
  return { id: e.id, re: new RegExp(e.match, 'i'), category: e.category };
});
const productGuide = {};
const unguided = [];
for (const p of ALL_PRODUCTS) {
  const fits = (g, text) => g.re.test(text) && (!g.category || g.category.includes(p.category));
  // The product's own name decides first; its sub-type label only when no entry matches the name.
  const hit = compiled.find((g) => fits(g, p.name)) ?? compiled.find((g) => fits(g, `${p.name} | ${p.subcategory}`));
  if (hit) productGuide[p.slug] = hit.id;
  else unguided.push(`${p.slug} (${p.subcategory})`);
}

// ── 2. Descriptive sentences from the PDFs ──────────────────────────────────────────────────────────────────
const MAKER = /\bsa\s?f\s?[eo]?\s?l?\s?[lo]?\s?l?\s?i\s?f\s?t(?!\s?ing)[a-z]*|\bsaif\b|\bindustries\b/i;
const DROP = new RegExp(
  [
    '₹', '\\brs\\b', '\\bprices?\\b', '\\bmrp\\b', '\\bdiscount', '\\bgst\\b', '\\btax', '\\bnet rate', 'ex[ -]?works', 'f\\.o\\.r\\b',
    'freight', '\\bdelivery\\b', '\\bpayment', 'validity', '\\bterms\\b', 'conditions', 'supersede', 'effective (from|date)', 'w\\.?e\\.?f',
    'quotation', 'invoice', 'per piece', 'per pc', 'per set', 'packing', 'www', 'http', '\\S@\\S', '\\.com', '\\bphone', '\\btel\\b', '\\bfax',
    'mobile', 'e-?mail', 'address', 'plot no', 'gidc', 'certif', 'intertek', 'iso 9001', 'copyright', 'rights reserved', 'subject to',
    'notice', 'jurisdiction', 'surcharge', 'hsn', '\\bpage\\b', 'contents', 'price list', 'catalogue', 'brochure', 'kolkata', 'ankleshwar',
    'gujarat', 'pvt', 'ltd', 'limited', 'private', 'reading this list', 'all sizes in',
  ].join('|'),
  'i',
);
// Sentences a person has read and ruled out (scripts/sidekick/passage-review.json).
const REVIEWED_OUT = JSON.parse(readFileSync(join(HERE, 'passage-review.json'), 'utf8')).drop.map((t) => normalize(t));
const SELF = /\b(we|our|ours|us)\b/i; // the supplier talking about itself — not true of Steel Tools India
// Maker's marketing claims can't be checked, so they are not repeated.
const CLAIM = /\b(patent\w*|innovative|world|leading|no\.?\s?1|number one|best in|unmatched|unbeatable|guarantee\w*|latest|most (productive|efficient|advanced|reliable|popular|trusted))\b/i;

// Vocabulary of real words: everything in the catalogue and guide, plus common English.
const COMMON = new Set(
  ('used use for with and the of to in a an is are be can by on as or from at it its this that which suitable ideal designed ' +
    'provides provide ensure ensures better higher high low lower long life wide range performance quality excellent good ' +
    'reduced reduce improved improve smooth accurate accuracy precision precise strong strength resistance resistant wear ' +
    'heat hardness hard soft material materials steel steels iron cast alloy stainless aluminium copper brass bronze plastic ' +
    'wood machining machine machines cutting cut cuts drilling drill holes hole milling turning finishing roughing general ' +
    'applications application operations operation tool tools life speed speeds feed feeds coolant dry wet surface finish ' +
    'chip chips edge edges point angle geometry coating coated uncoated grade grades type types special standard series ' +
    'heavy duty light medium easy easily safe safety load loads lifting lift weight capacity working limit inspection before ' +
    'after every each all any not no do does should must will may also more most less very only one two three four ' +
    'available supplied made manufactured forged treated tested test quenched tempered galvanised galvanized painted').split(' '),
);
const vocab = new Set(COMMON);
const addWords = (t) => { for (const w of tokenize(t ?? '')) vocab.add(w); };
for (const p of ALL_PRODUCTS) {
  addWords(`${p.name} ${p.subcategory} ${p.summary} ${p.description} ${p.standard ?? ''}`);
  for (const s of p.specifications) addWords(`${s.label} ${s.value}`);
}
for (const g of Object.values(guides)) addWords(`${g.title} ${g.uses} ${g.how.join(' ')} ${(g.tips ?? []).join(' ')}`);

// Paragraphs are re-joined (PDF and OCR lines wrap mid-sentence), bullets become separate items, then split into
// sentences. Each item remembers whether it ended properly, so cut-off fragments can be dropped.
function sentences(text) {
  const blocks = text
    .replace(/\r/g, '')
    .replace(/[•▪■●◆►™®]|(^|\n)\s*[m=e>*@]\s(?=[A-Z])|\s[>*@§]\s|\sm\s(?=[A-Z0-9])/g, '\n\n')
    .split(/\n\s*\n/);
  const out = [];
  for (const block of blocks) {
    const joined = block.replace(/-\n(?=[a-z])/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (!joined) continue;
    for (const s of joined.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
      const clean = s
        .replace(/^[\s\-–:;,.|>]+/, '')
        .replace(/^\(?[0-9a-z]{1,3}[).]\s+/i, '')
        .replace(/^[A-Za-z]{1,2}\s+(?=[A-Z])/, '') // stray OCR bullet like "Mg "
        .trim();
      if (clean) out.push({ text: clean, ended: /[.!?]$/.test(clean) });
    }
  }
  return out;
}

// A real descriptive sentence has a verb, isn't a heading in capitals, isn't a table row, and doesn't trail off.
const VERB = /\b(is|are|was|be|been|has|have|can|will|gives?|provides?|ensures?|allows?|helps?|offers?|makes?|keeps?|reduces?|improves?|increases?|prevents?|protects?|suits?|designed|made|used|suitable|ideal|enables?|delivers?|consists?|comes?|meets?|conforms?|resists?|avoids?|requires?|supports?|holds?|grips?|fits?|works?|features?)\b/i;
const TRAILING = /\b(and|or|the|a|an|with|in|of|to|for|is|are|from|by|as|at|on|extremely|very|up)\.?$/i;

const rejected = {};
const dropSamples = [];
const reject = (why) => ((rejected[why] = (rejected[why] ?? 0) + 1), false);
function isDescriptive({ text: s, ended }) {
  if (s.length < 45 || s.length > 420) return reject('length');
  if (DROP.test(s)) {
    if (process.argv.includes('--debug') && s.split(/\s+/).length >= 8) dropSamples.push(`${s.match(DROP)[0]} :: ${s.slice(0, 140)}`);
    return reject('commercial / contact / heading words');
  }
  if (SELF.test(s)) return reject('supplier speaking ("we", "our")');
  if (CLAIM.test(s)) return reject('marketing claim');
  if (MAKER.test(s)) return reject('maker name');
  if (!VERB.test(s) || TRAILING.test(s) || /[|_=+*>~—…]|\.\s?\.|\s[a-z]\s[a-z]\s|[a-z]\.[A-Z]/i.test(s)) return reject('not a full sentence');
  // Two columns read as one line show up as capitalised words in the middle of a "sentence".
  const midCaps = s.split(/\s+/).slice(1).filter((w) => /^[A-Z][a-z]+$/.test(w)).length;
  if (midCaps > 2) return reject('columns run together (OCR)');
  // "...damaged chemicals. knotted or twisted..." — a full stop then a lower-case word is two columns interleaved.
  if (/[a-z]\. [a-z]/.test(s)) return reject('columns run together (OCR)');
  // "This point helps…" leans on the sentence before it, which the customer won't see.
  if (/^(This|These|Such|Additionally|Also|Moreover|Furthermore)\b/.test(s)) return reject('refers to an earlier sentence');
  if (/\s[B-HJ-Z]\s(?=[a-z])/.test(s)) return reject('unreadable (OCR noise / typos)'); // "chips J and"
  if (REVIEWED_OUT.some((r) => normalize(s).startsWith(r))) return reject('dropped in passage-review.json');
  const chars = s.replace(/\s/g, '');
  const letters = (chars.match(/[a-z]/gi) ?? []).length;
  const upper = (chars.match(/[A-Z]/g) ?? []).length;
  const numbers = (s.match(/\b\d+(\.\d+)?\b/g) ?? []).length;
  if (letters / chars.length < 0.8 || upper / letters > 0.35 || numbers > 2) return reject('table row / heading');
  const words = s.split(/\s+/).filter((w) => /[a-z]{3,}/i.test(w));
  if (words.length < 7) return reject('too short');
  const known = words.filter((w) => vocab.has(stem(normalize(w).replace(/\s.*/, ''))));
  if (known.length / words.length < 0.8 || words.length - known.length > 2) return reject('unreadable (OCR noise / typos)');
  return ended ? true : reject('cut off');
}

const tidy = (s) => {
  let t = s.replace(/\s+([,.;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (/^[A-Z0-9 &\-/()]+$/.test(t)) t = t.charAt(0) + t.slice(1).toLowerCase(); // ALL-CAPS lines → sentence case
  return /[.!?]$/.test(t) ? t : `${t}.`;
};

const pdfDir = join(HERE, 'pdf-text');
const docs = readdirSync(pdfDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(pdfDir, f), 'utf8')));
const passages = [];
const seen = new Set();
const sources = [];
const pageOf = new Map(); // passage index → candidate product slugs (by source page)

// Which catalogue pages does each PDF page hold? The product data records the page number printed in the
// catalogue. Usually that is the PDF page, give or take a cover; the lifting brochure is printed two pages to a
// sheet. The layout is detected by checking where product names actually appear: PDF page n holds printed pages
// perSheet × n + shift … perSheet × n + shift + perSheet − 1.
const sourcesOf = (p) => [p.source, ...(p.otherSources ?? [])];
const printedPages = (layout, n) => Array.from({ length: layout.perSheet }, (_, i) => layout.perSheet * n + layout.shift + i);
const productsOn = (doc, pages) =>
  ALL_PRODUCTS.filter((p) => sourcesOf(p).some((s) => s.doc === doc && pages.includes(s.page)));

function detectLayout(doc) {
  let best = { perSheet: 1, shift: 0, hits: -1 };
  const products = ALL_PRODUCTS.filter((x) => x.source.doc === doc.doc);
  for (const perSheet of [1, 2]) {
    for (let shift = -8; shift <= 8; shift++) {
      let hits = 0;
      for (const p of products) {
        const n = Math.floor((p.source.page - shift) / perSheet);
        const page = doc.pages[n - 1];
        if (!page) continue;
        const text = ` ${normalize(page.text)} `;
        const words = tokenize(p.name).filter((w) => w.length > 3);
        if (words.length && words.filter((w) => text.includes(` ${w}`)).length / words.length >= 0.6) hits++;
      }
      if (hits > best.hits) best = { perSheet, shift, hits };
    }
  }
  return best;
}

// Distinctive words of each product's name ("polyester", "webbing", "sling" — not "heavy", "duty", "series").
const GENERIC = new Set(['tool', 'steel', 'heavy', 'duty', 'standard', 'type', 'series', 'set', 'long', 'short', 'hss', 'carbide', 'solid']);
const nameWords = new Map(
  ALL_PRODUCTS.map((p) => [p.slug, [...new Set(tokenize(`${p.name} ${p.subcategory}`).filter((w) => w.length > 2 && !GENERIC.has(w) && !/^\d/.test(w)))]]),
);

/**
 * Bullets under "The unique advantages of webbing sling:" rarely repeat the product's name, so each page is read
 * in order and every sentence inherits the product the page was last talking about. A line names a product when
 * it shares two of its name words, or one word no other product on that page has.
 */
function mentioned(text, near) {
  const words = new Set(tokenize(text));
  const hits = near.map((slug) => {
    const own = nameWords.get(slug) ?? [];
    const overlap = own.filter((w) => words.has(w));
    const unique = overlap.some((w) => near.every((o) => o === slug || !(nameWords.get(o) ?? []).includes(w)));
    return { slug, n: overlap.length, named: overlap.length >= 2 || unique };
  }).filter((h) => h.named);
  const top = Math.max(0, ...hits.map((h) => h.n));
  return hits.filter((h) => h.n === top).map((h) => h.slug);
}

const subjectOf = new Map(); // passage index → the product(s) its page was talking about
// On a sheet with two products side by side, OCR can interleave their columns block by block, so the page's
// "current subject" can't be trusted there: those sentences are used only when they name their product.
const twoUp = new Set();
for (const doc of docs) {
  const layout = detectLayout(doc);
  let kept = 0;
  for (const page of doc.pages) {
    // Intro text usually sits just before its size table, so nearby pages count too (on a two-up sheet, the sheet).
    const span = layout.perSheet === 1 ? [-1, 0, 1, 2] : [0];
    const near = [...new Set(span.flatMap((d) => productsOn(doc.doc, printedPages(layout, page.page + d)).map((p) => p.slug)))];
    let subject = [];
    for (const s of sentences(page.text)) {
      const named = mentioned(s.text, near);
      if (named.length) subject = named;
      if (!isDescriptive(s)) continue;
      const text = tidy(s.text);
      const key = normalize(text);
      if (seen.has(key)) continue;
      seen.add(key);
      const idx = passages.push({ t: text, d: doc.doc, p: page.page }) - 1;
      pageOf.set(idx, near.map((slug) => ({ slug })));
      if (layout.perSheet > 1) twoUp.add(idx);
      subjectOf.set(idx, subject);
      kept++;
    }
  }
  sources.push({
    doc: doc.doc,
    title: doc.title,
    pages: doc.pages.length,
    ocrPages: doc.pages.filter((p) => p.method === 'ocr').length,
    passages: kept,
    layout,
  });
}

// ── 3. Link passages to products ────────────────────────────────────────────────────────────────────────────
// A passage belongs to a product printed on the same page whose name it shares words with; passages on pages
// without products are linked only when they clearly name a product type.
const productPassages = {};
const ownText = new Map(ALL_PRODUCTS.map((p) => [p.slug, normalize(`${p.description} ${p.specifications.map((x) => x.value).join(' ')}`)]));
passages.forEach((ps, idx) => {
  const words = new Set(tokenize(ps.t));
  const near = pageOf.get(idx) ?? [];
  const subject = subjectOf.get(idx) ?? [];
  const named = twoUp.has(idx) ? mentioned(ps.t, near.map((n) => n.slug)).filter((slug) => (nameWords.get(slug) ?? []).filter((w) => words.has(w)).length >= 2) : [];
  const candidates = [];
  for (const p of ALL_PRODUCTS.filter((x) => sourcesOf(x).some((src) => src.doc === ps.d))) {
    const nw = nameWords.get(p.slug) ?? [];
    if (!nw.length) continue;
    const overlap = nw.filter((w) => words.has(w)).length;
    const samePage = near.some((n) => n.slug === p.slug);
    const onSubject = subject.includes(p.slug);
    const ok = twoUp.has(idx)
      ? samePage && named.includes(p.slug)
      : onSubject || (samePage ? overlap >= 1 : overlap >= Math.max(2, Math.ceil(nw.length * 0.7)));
    // Already shown from the product data? Then it adds nothing.
    const repeat = normalize(ps.t).split(' ').filter((w) => w.length > 3);
    const dup = repeat.filter((w) => ownText.get(p.slug).includes(w)).length / Math.max(1, repeat.length) > 0.85;
    if (ok) candidates.push({ slug: p.slug, dup, score: overlap + (samePage ? 2 : 0) + (onSubject ? 3 : 0) + overlap / nw.length });
  }
  // Only the best-matching product(s) get the sentence — and if it already shows there, nobody does (handing it
  // to the runner-up is how a hand stacker's features would end up under the drum tilter beside it).
  const best = Math.max(0, ...candidates.map((c) => c.score));
  const winners = candidates.filter((c) => c.score >= best - 0.01);
  if (winners.some((c) => c.dup)) return;
  for (const c of winners) (productPassages[c.slug] ??= []).push({ idx, score: c.score });
});
for (const slug of Object.keys(productPassages)) {
  productPassages[slug] = productPassages[slug].sort((a, b) => b.score - a.score).slice(0, 4).map((x) => x.idx);
}
// Keep only passages that are linked to something.
const used = [...new Set(Object.values(productPassages).flat())].sort((a, b) => a - b);
const remap = new Map(used.map((old, i) => [old, i]));
const keptPassages = used.map((i) => passages[i]);
for (const slug of Object.keys(productPassages)) productPassages[slug] = productPassages[slug].map((i) => remap.get(i));
for (const s of sources) s.passages = keptPassages.filter((p) => p.d === s.doc).length;

// ── 4. Write the knowledge file ─────────────────────────────────────────────────────────────────────────────
const syn = json('synonyms.json');
const knowledge = {
  version: 1,
  trainedAt: new Date().toISOString(),
  sources: sources.map(({ layout, ...s }) => s),
  guides,
  productGuide,
  passages: keptPassages,
  productPassages,
  synonyms: { replace: syn.replace, related: syn.related, jobs: syn.jobs ?? {} },
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(knowledge));

console.log(`Sidekick trained on ${ALL_PRODUCTS.length} products and ${docs.length} catalogues → ${OUT.replace(ROOT + '/', '')}`);
for (const s of sources) {
  console.log(`  ${s.doc.padEnd(8)} ${String(s.pages).padStart(3)} pages (${s.ocrPages} by OCR)  ${String(s.passages).padStart(4)} passages kept${s.layout.perSheet > 1 ? `  (${s.layout.perSheet} catalogue pages per sheet)` : s.layout.shift ? `  (page offset ${s.layout.shift})` : ''}`);
}
if (process.argv.includes('--debug')) {
  console.log('  rejected sentences:', rejected);
  console.log('  candidates before linking:', passages.length);
  console.log('  sample of dropped sentences:\n    ' + dropSamples.filter((_, i) => i % 7 === 0).slice(0, 45).join('\n    '));
  for (const p of passages.slice(0, 400)) console.log(`    [${p.d} p${p.p}] ${p.t}`);
}
console.log(`  tool guide: ${Object.keys(productGuide).length}/${ALL_PRODUCTS.length} products covered by ${Object.keys(guides).length} entries`);
console.log(`  catalogue passages linked to ${Object.keys(productPassages).length} products`);
console.log(`  knowledge.json: ${(Buffer.byteLength(JSON.stringify(knowledge)) / 1024).toFixed(0)} KB`);
if (unguided.length) console.log(`  ⚠ no guide entry for ${unguided.length}: ${unguided.slice(0, 12).join(', ')}${unguided.length > 12 ? ' …' : ''}`);

// ── 5. Exam: ask Sidekick the questions in eval.json ───────────────────────────────────────────────────────
const engine = new SidekickEngine(ALL_PRODUCTS, CATEGORIES, knowledge, {
  name: COMPANY.name,
  city: COMPANY.city,
  foundedYear: COMPANY.foundedYear,
  phoneDisplay: COMPANY.phoneDisplay,
  whatsappDisplay: COMPANY.whatsappDisplay,
  email: COMPANY.email,
  addressLines: COMPANY.address.lines,
  pincode: COMPANY.address.pincode,
  hours: COMPANY.hours,
});
const exam = json('eval.json').questions;
const failures = [];
let ctx = { products: [], turn: 0 };
for (const q of exam) {
  if (q.newChat) ctx = { products: [], turn: 0 };
  const r = engine.answer(q.ask, ctx);
  ctx = r.context;
  const text = JSON.stringify(r.blocks).toLowerCase();
  const problems = [];
  if (q.intent && r.intent !== q.intent) problems.push(`intent ${r.intent} ≠ ${q.intent}`);
  if (q.product && !r.products.slice(0, q.within ?? 3).some((s) => s.includes(q.product))) problems.push(`products [${r.products.slice(0, 3).join(', ')}] lack ${q.product}`);
  for (const must of q.says ?? []) if (!text.includes(must.toLowerCase())) problems.push(`missing "${must}"`);
  if (/₹|\brs\.?\s?\d/.test(text)) problems.push('mentions a price');
  if (MAKER.test(text.replace(/industries/g, ''))) problems.push('mentions the lifting maker');
  if (problems.length) failures.push(`  ✗ "${q.ask}" — ${problems.join('; ')}`);
}
console.log(`\nExam: ${exam.length - failures.length}/${exam.length} questions answered as expected`);
if (failures.length) console.log(failures.join('\n'));
if (process.argv.includes('--strict') && failures.length) process.exit(1);
