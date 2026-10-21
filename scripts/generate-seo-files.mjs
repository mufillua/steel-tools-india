// Writes public/sitemap.xml and public/robots.txt from the catalogue data and COMPANY.siteUrl.
// Runs automatically before `npm run build` (see "prebuild" in package.json).
//
// <lastmod> is the date a page's content last changed, not the build date: Google only uses lastmod when it is
// accurate, and a sitemap where every page says "changed today" on every build gets its dates ignored.
// scripts/sitemap-lastmod.json remembers a fingerprint of each page's data; when the data changes, that page's
// date moves to today. Commit the file together with the catalogue change.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const load = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
};

const { ALL_PRODUCTS } = await load('src/app/data/products/index.ts');
const { CATEGORIES } = await load('src/app/data/categories.ts');
const { COMPANY } = await load('src/app/config/company.config.ts');
const site = COMPANY.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Bump when the page templates change in a way that matters to Google (titles, headings, structured data):
// every page then gets today's date, so Google re-crawls them. v2 (Oct 2026): keyword titles, no Product markup.
const TEMPLATE_VERSION = 2;
const hash = (data) => createHash('sha1').update(JSON.stringify([TEMPLATE_VERSION, data])).digest('hex').slice(0, 12);
const productsIn = (slug) => ALL_PRODUCTS.filter((p) => p.category === slug);

// Each entry: path, the data its content is built from (for lastmod), and optional images (site-relative paths)
// → <image:image> tags, so product photos can show in Google Images.
const pages = [
  { path: '/', data: [CATEGORIES, ALL_PRODUCTS.length, COMPANY], images: ['assets/hero/product-range.webp'] },
  { path: '/products', data: ALL_PRODUCTS.map((p) => [p.slug, p.name, p.summary]) },
  { path: '/categories', data: CATEGORIES },
  ...CATEGORIES.map((c) => ({ path: `/categories/${c.slug}`, data: [c, productsIn(c.slug).map((p) => [p.slug, p.name, p.subcategory])] })),
  { path: '/about-us', data: [COMPANY, CATEGORIES.map((c) => c.name)] },
  { path: '/contact', data: COMPANY },
  { path: '/get-a-quote', data: COMPANY },
  ...ALL_PRODUCTS.map((p) => ({ path: `/products/${p.slug}`, data: p, images: p.images })),
];

const MANIFEST = 'scripts/sitemap-lastmod.json';
const before = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const after = {};
let changed = 0;
for (const p of pages) {
  const h = hash(p.data);
  const prev = before[p.path];
  after[p.path] = prev && prev.hash === h ? prev : { hash: h, lastmod: today };
  if (after[p.path] !== prev) changed++;
  p.lastmod = after[p.path].lastmod;
}
writeFileSync(MANIFEST, JSON.stringify(after, null, 1) + '\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (p) =>
      `  <url><loc>${site}${p.path}</loc><lastmod>${p.lastmod}</lastmod>` +
      (p.images ?? []).map((i) => `<image:image><image:loc>${esc(`${site}/${i}`)}</image:loc></image:image>`).join('') +
      `</url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync('public/sitemap.xml', xml);
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap.xml: ${pages.length} URLs on ${site} (${changed} with new or changed content)`);
