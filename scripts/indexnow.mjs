// Tells Bing (and other IndexNow search engines: Yandex, Seznam, Naver…) which pages exist or changed, so they
// crawl them straight away instead of waiting. Google does not use IndexNow — for Google, the sitemap in Search
// Console is the equivalent.
//
// Run AFTER the new build is live (the key file must be reachable on the site):
//   npm run indexnow                      → every URL in public/sitemap.xml
//   npm run indexnow -- --since 2026-11-01 → only pages whose content changed on/after that date
import { readFileSync } from 'node:fs';

const KEY = 'fde1194183cc832a9a03b58826588641'; // also served as /fde1194183cc832a9a03b58826588641.txt (public/fde1194183cc832a9a03b58826588641.txt) — keep the two in sync
const xml = readFileSync('public/sitemap.xml', 'utf8');
const since = process.argv.includes('--since') ? process.argv[process.argv.indexOf('--since') + 1] : '';
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ url: m[1], lastmod: m[2] }));
const urlList = entries.filter((e) => !since || e.lastmod >= since).map((e) => e.url);
if (!urlList.length) {
  console.log('Nothing to submit.');
  process.exit(0);
}
const site = new URL(urlList[0]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: site.host, key: KEY, keyLocation: `${site.origin}/${KEY}.txt`, urlList }),
});
// 200/202 = accepted. 403 = key file not found on the site yet (deploy first). 422 = URLs not on this host.
console.log(`IndexNow: ${urlList.length} URLs → HTTP ${res.status} ${res.statusText}`);
