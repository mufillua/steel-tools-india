# SEO launch checklist — www.steeltoolsindia.in

What the website already does (built in):

- Every page is prerendered HTML with its own title, description and canonical link on https://www.steeltoolsindia.in.
- Home title: "Steel Tools India | Industrial Tools Supplier in Kolkata, Since 1957".
- 20 category landing pages (`/categories/<slug>`, e.g. `/categories/hoists-pulley-blocks`) titled
  "<Category> Supplier in Kolkata", each linking to every product in the category.
- Google structured data: business record (HardwareStore: name, address, phone, email, hours, map link, catalogue),
  WebSite (site name), Product + breadcrumb on every product page, CollectionPage + item list on category pages.
- `sitemap.xml` (689 pages + 500 product photos for Google Images) and `robots.txt`. Each page's `<lastmod>` is the date
  its content last changed (kept in `scripts/sitemap-lastmod.json`), so Google can trust it and re-crawl changed pages first.
- Every page is at most 2 clicks from the home page (home → category page → product).
- Lighthouse (mobile): SEO 100, Accessibility 100, Best practices 100 on home, category and product pages.

What only the owner can do — in this order:

1. **Upload the new build** (`dist/steel-tools-india/browser/`, including the hidden `.htaccess` file and `404.html`) to the host for
   www.steeltoolsindia.in, replacing the old files.
2. **One address**: steeltoolsindia.in (no www) must redirect permanently to https://www.steeltoolsindia.in.
   Apache/cPanel: done by `.htaccess`. Vercel: done by `vercel.json` (or Settings → Domains → steeltoolsindia.in →
   "Redirect to www.steeltoolsindia.in", 308). Netlify: done by `_redirects`. Cloudflare Pages: add a redirect rule in the
   Cloudflare dashboard. Check: opening https://steeltoolsindia.in must change the address bar to https://www.steeltoolsindia.in. Keep steeltoolsind.com forwarding (301, permanent) to https://www.steeltoolsindia.in at the registrar.
3. **Google Search Console** (property steeltoolsindia.in): Sitemaps → submit `https://www.steeltoolsindia.in/sitemap.xml`,
   then URL Inspection → "Request indexing" for the home page and a few category pages
   (e.g. https://www.steeltoolsindia.in/categories/hoists-pulley-blocks).
4. **"Product snippets" warning** ("Either 'offers', 'review' or 'aggregateRating' should be specified"): expected, because the
   site shows no prices or reviews. It does not affect indexing or ranking; those product pages simply can't show price/star
   extras in results.
5. **Google Business Profile** (business.google.com) — the biggest single factor for local and Google Maps results:
   name exactly "Steel Tools India", address exactly as on the site (67/B, N. S. Road, Room No. 37, Kolkata 700001),
   phone +91 98302 58198, website https://www.steeltoolsindia.in, hours Mon–Fri 10–6, Sat 10–5, Sun closed.
   Add shop and product photos and ask regular customers for Google reviews.
6. **Bing Webmaster Tools** (bing.com/webmasters): sign in and import the site from Search Console. After each deploy run
   `npm run indexnow` — it tells Bing (also used by ChatGPT search, DuckDuckGo, Yahoo) about every page at once.
7. **Business listings** — IndiaMART, TradeIndia, JustDial: these rank high for generic tool searches in Kolkata.
   Use the same name, address and phone everywhere and link to https://www.steeltoolsindia.in.
8. **Social profiles**: Instagram (@steeltoolsindia) is already in the structured data (`sameAs`). Put the website in its bio.
   Add any new profile (Facebook, LinkedIn) to `COMPANY_LINKS` and the `sameAs` list in `seo.service.ts`.

## Keyword targets (Search Console + Google search volume, India, Oct 2026)

Category pages lead with the product names buyers search (`src/app/config/seo-keywords.config.ts`); product titles are
"<Taparia/Miranda> <product> in Kolkata". Monthly searches in India for terms the site now targets:

| Search term | Searches/month | Page |
|---|---|---|
| allen key set · pipe wrench | 22,200 each | /categories/spanners-wrenches |
| spring balancer | 18,100 | /categories/hoists-pulley-blocks |
| bench vice | 12,100 | /categories/workshop-equipment |
| hand pallet truck | 6,600 | /categories/material-handling, /products/hand-pallet-truck |
| d shackle | 6,600 | /categories/lifting-chain-rigging |
| taparia screwdriver set | 6,600 | /categories/screwdrivers-bits |
| eye bolt · turnbuckle | 5,400 · 4,400 | /categories/lifting-chain-rigging |
| taparia pliers | 4,400 | /categories/pliers-cutting-tools |
| chain pulley block | 2,900 | /categories/hoists-pulley-blocks |
| hss drill bit | 2,400 | /categories/hss-cutting-tools |
| end mill · hole saw · collet chuck | 1,900 · 1,600 · 1,300 | solid carbide / power tool accessories / machine tool accessories |
| taparia socket set · taparia spanner set | 1,600 each | sockets / spanners |
| electric chain hoist · webbing sling · manual stacker | 1,000 · 880 · 880 | hoists / slings / material handling |

These national terms are led by IndiaMART, Amazon and manufacturers; "<term> Kolkata" and exact product names
(sizes, standards) are where a Kolkata stockist wins first. Check Search Console → Performance → Queries monthly
and strengthen the pages whose queries sit at positions 5–20.

## Getting the remaining pages indexed

Search Console's "Discovered – currently not indexed" / "Crawled – currently not indexed" lists are normal for a new site:
Google found the URLs (sitemap, links) and is spreading the crawling out over weeks. It cannot be forced. What speeds it up:

- **Sitemap**: Search Console → Sitemaps → submit `https://www.steeltoolsindia.in/sitemap.xml` again after each deploy.
- **Request indexing** (URL Inspection, about 10 a day): start with the 20 category pages — each one links to every product in
  its category, so one crawl leads Google to many products. Then /products, /categories, /contact.
- **Request-indexing order** (URL Inspection → paste → "Request indexing"; about 10 a day):
  - Day 1: https://www.steeltoolsindia.in/ then /categories/hoists-pulley-blocks, /categories/lifting-chain-rigging,
    /categories/slings-lashing, /categories/lifting-clamps-magnets, /categories/workshop-equipment, /categories/screwdrivers-bits,
    /categories/sockets-accessories, /categories/hss-cutting-tools, /categories/lathe-centres
  - Day 2: the remaining category pages not yet indexed (check each with URL Inspection first)
  - Day 3 onwards: /products/hand-pallet-truck, /products/spring-balancer, /products/chain-pulley-block-b-series,
    /products/screw-pin-dee-shackle, /products/eye-bolt-din-580-galvanised, /products/taparia-heavy-duty-pipe-wrenches,
    /products/taparia-allen-key-sets-black-finish-mm, /products/taparia-bench-vice-fixed-base, /products/bt-40-er-collet-chuck,
    then the rest of the "Popular searches" links on the home page.
- **Links from other websites** are what make Google crawl a new domain faster: Google Business Profile, IndiaMART/TradeIndia/
  JustDial listings, Instagram bio, supplier/customer sites. A brand-new domain with no outside links is crawled slowly.
- **Do not** click "Validate fix" on these reports, change URLs, or re-upload the same pages under new names — that resets the queue.
- Re-check the Pages report every 1–2 weeks; the "Indexed" count should climb steadily.

What to expect: searches for the business name ("Steel Tools India", "Steel Tools India Kolkata") normally show the site
first within days to a few weeks of Google indexing it. Generic searches ("chain pulley block Kolkata") take months and
depend on the Business Profile, reviews and listings linking to the site. No one can guarantee a #1 position.
