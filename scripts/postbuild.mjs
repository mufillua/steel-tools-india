// Runs automatically after `npm run build` (see "postbuild" in package.json).
// Copies the prerendered not-found page to 404.html at the site root. Vercel, Netlify, Cloudflare Pages and
// GitHub Pages serve /404.html with a real 404 status for any address that has no page (Apache: see .htaccess),
// so Google never indexes mistyped or old URLs as copies of the home page.
import { copyFileSync, existsSync } from 'node:fs';

const out = 'dist/steel-tools-india/browser';
if (!existsSync(`${out}/404/index.html`)) {
  console.error('postbuild: dist/steel-tools-india/browser/404/index.html not found — was /404 prerendered?');
  process.exit(1);
}
copyFileSync(`${out}/404/index.html`, `${out}/404.html`);
console.log('postbuild: 404.html written');
