# SEO launch checklist — www.steeltoolsindia.in

What the website already does (built in):

- Every page is prerendered HTML with its own title, description and canonical link on https://www.steeltoolsindia.in.
- Home title: "Steel Tools India — Industrial Tools Supplier in Kolkata since 1957".
- 20 category landing pages (`/categories/<slug>`, e.g. `/categories/hoists-pulley-blocks`) titled
  "<Category> Supplier in Kolkata", each linking to every product in the category.
- Google structured data: business record (HardwareStore: name, address, phone, email, hours, map link, catalogue),
  WebSite (site name), Product + breadcrumb on every product page, CollectionPage + item list on category pages.
- `sitemap.xml` (689 pages + 500 product photos for Google Images) and `robots.txt`.
- Lighthouse (mobile): SEO 100, Accessibility 100, Best practices 100 on home, category and product pages.

What only the owner can do — in this order:

1. **Upload the new build** (`dist/steel-tools-india/browser/`, including the hidden `.htaccess` file) to the host for
   www.steeltoolsindia.in, replacing the old files.
2. **One address**: on Apache/cPanel hosting the new `.htaccess` sends http:// and steeltoolsindia.in (no www) to
   https://www.steeltoolsindia.in. Keep steeltoolsind.com forwarding (301, permanent) to https://www.steeltoolsindia.in at the registrar.
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
6. **Bing Webmaster Tools** (bing.com/webmasters): sign in and import the site from Search Console.
7. **Business listings** — IndiaMART, TradeIndia, JustDial: these rank high for generic tool searches in Kolkata.
   Use the same name, address and phone everywhere and link to https://www.steeltoolsindia.in.
8. **Social profiles** (Instagram, Facebook, LinkedIn): put the website in the bio. Send the profile links to the developer
   so they can be added to the site's structured data (`sameAs`).

What to expect: searches for the business name ("Steel Tools India", "Steel Tools India Kolkata") normally show the site
first within days to a few weeks of Google indexing it. Generic searches ("chain pulley block Kolkata") take months and
depend on the Business Profile, reviews and listings linking to the site. No one can guarantee a #1 position.
