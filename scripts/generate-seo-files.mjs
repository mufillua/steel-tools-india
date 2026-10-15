// Writes public/sitemap.xml and public/robots.txt from the catalogue data and COMPANY.siteUrl.
// Runs automatically before `npm run build` (see "prebuild" in package.json).
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

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

// Each entry may carry images (site-relative paths) → <image:image> tags, so product photos can show in Google Images.
const pages = [
  { path: '/', priority: '1.0', freq: 'weekly', images: ['assets/hero/product-range.webp'] },
  { path: '/products', priority: '0.9', freq: 'weekly' },
  { path: '/categories', priority: '0.8', freq: 'monthly' },
  ...CATEGORIES.map((c) => ({ path: `/categories/${c.slug}`, priority: '0.9', freq: 'monthly' })),
  { path: '/about-us', priority: '0.6', freq: 'yearly' },
  { path: '/contact', priority: '0.7', freq: 'yearly' },
  { path: '/get-a-quote', priority: '0.7', freq: 'yearly' },
  ...ALL_PRODUCTS.map((p) => ({ path: `/products/${p.slug}`, priority: '0.8', freq: 'monthly', images: p.images })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (p) =>
      `  <url><loc>${site}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority>` +
      (p.images ?? []).map((i) => `<image:image><image:loc>${esc(`${site}/${i}`)}</image:loc></image:image>`).join('') +
      `</url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync('public/sitemap.xml', xml);
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap.xml: ${pages.length} URLs on ${site}`);
