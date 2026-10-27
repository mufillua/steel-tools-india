// Ask Sidekick from the terminal, exactly as the website would answer:
//   npm run sidekick:ask -- "what is a revolving centre used for?" "what sizes?"
// Several questions in one call are asked as one conversation (follow-ups use the earlier answers).
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const load = async (entry) => {
  const out = await build({ entryPoints: [join(ROOT, entry)], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
};
const { ALL_PRODUCTS } = await load('src/app/data/products/index.ts');
const { CATEGORIES } = await load('src/app/data/categories.ts');
const { COMPANY } = await load('src/app/config/company.config.ts');
const { SidekickEngine } = await load('src/app/sidekick/engine/engine.ts');
const knowledge = JSON.parse(readFileSync(join(ROOT, 'public/assets/sidekick/knowledge.json'), 'utf8'));

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

let ctx = { products: [], turn: 0 };
for (const q of process.argv.slice(2)) {
  const r = engine.answer(q, ctx);
  ctx = r.context;
  console.log(`\n▶ ${q}   [${r.intent}]`);
  for (const b of r.blocks) {
    if (b.kind === 'text' || b.kind === 'note') console.log(`  ${b.kind === 'note' ? 'ⓘ ' : ''}${b.text}`);
    if (b.kind === 'list') console.log(`${b.title ? `  ${b.title}:\n` : ''}${b.items.map((x, i) => `    ${b.ordered ? `${i + 1}.` : '•'} ${x}`).join('\n')}`);
    if (b.kind === 'facts') console.log(`${b.title ? `  ${b.title}:\n` : ''}${b.rows.map((r2) => `    ${r2.label}: ${r2.value}`).join('\n')}`);
    if (b.kind === 'sizes') console.log(`  ${b.title}: ${b.items.join(' | ')}${b.more ? ` (+${b.more} more)` : ''}`);
    if (b.kind === 'products') console.log(`  [cards] ${b.items.map((p) => p.name).join(' · ')}`);
    if (b.kind === 'links') console.log(`  [links] ${b.items.map((l) => `${l.label}${l.meta ? ` (${l.meta})` : ''}`).join(' · ')}`);
  }
  if (r.actions.length) console.log(`  [buttons] ${r.actions.map((a) => a.label).join(' · ')}`);
  if (r.suggestions.length) console.log(`  [chips] ${r.suggestions.map((s) => s.label).join(' · ')}`);
}
