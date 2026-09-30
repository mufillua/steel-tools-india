// Catalogue integrity check: node scripts/validate-catalogue.mjs
// Compiles the data files with esbuild (ships with Angular) and checks slugs, variants, images and "no price" rule.
import { build } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';

const out = await build({
  entryPoints: ['src/app/data/products/index.ts'],
  bundle: true, write: false, format: 'esm', platform: 'node',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const products = mod.ALL_PRODUCTS;
const catSrc = readFileSync('src/app/data/categories.ts', 'utf8');
const catSlugs = [...catSrc.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);

const errors = [];
const slugs = new Set();
for (const p of products) {
  if (slugs.has(p.slug)) errors.push(`duplicate slug ${p.slug}`);
  slugs.add(p.slug);
  if (!catSlugs.includes(p.category)) errors.push(`${p.slug}: unknown category ${p.category}`);
  for (const img of p.images) if (!existsSync(`public/${img}`)) errors.push(`${p.slug}: missing image ${img}`);
  const ids = new Set();
  for (const v of p.variants) {
    if (ids.has(v.id)) errors.push(`${p.slug}: duplicate variant id ${v.id}`);
    ids.add(v.id);
    for (const a of p.variantAxes) if (!(a in v.attributes)) errors.push(`${p.slug}: variant ${v.id} missing axis ${a}`);
  }
  if (/price|₹|\/-/i.test(JSON.stringify(p))) errors.push(`${p.slug}: contains price-like data`);
}
const byCat = Object.fromEntries(catSlugs.map((c) => [c, products.filter((p) => p.category === c).length]));
console.log(`products: ${products.length}  variants: ${products.reduce((n, p) => n + p.variants.length, 0)}  featured: ${products.filter((p) => p.featured).length}`);
console.log('per category:', byCat);
console.log('review notes:', products.filter((p) => p.reviewNote).map((p) => p.slug));
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('OK — no errors');
