// Writes public/sitemap.xml and public/robots.txt from the catalogue data and COMPANY.siteUrl.
// Runs automatically before `npm run build` (see "prebuild" in package.json).
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

const load = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
};

const { ALL_PRODUCTS } = await load('src/app/data/products/index.ts');
const { COMPANY } = await load('src/app/config/company.config.ts');
const site = COMPANY.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/products', priority: '0.9', freq: 'weekly' },
  { path: '/categories', priority: '0.8', freq: 'monthly' },
  { path: '/about-us', priority: '0.6', freq: 'yearly' },
  { path: '/contact', priority: '0.7', freq: 'yearly' },
  { path: '/get-a-quote', priority: '0.7', freq: 'yearly' },
  ...ALL_PRODUCTS.map((p) => ({ path: `/products/${p.slug}`, priority: '0.8', freq: 'monthly' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) =>
      `  <url><loc>${site}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync('public/sitemap.xml', xml);
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap.xml: ${pages.length} URLs on ${site}`);
