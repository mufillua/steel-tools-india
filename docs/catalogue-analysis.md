# Steel Tools India — Catalogue analysis (Phase 1)

Client rule: **no prices anywhere on the website.** Product data will carry no price fields.

## Source documents

| Ref | Document | Pages | Format | Price date(s) | Brand stated in document |
|---|---|---|---|---|---|
| RR-2025 | R★R Brand *Machine Tools Accessories* — Master Price List | 28 | **Scanned images** (no text layer) | w.e.f. 15-01-2025 | R★R Brand — D.M. Engineering Company (rrmachinetools.com) |
| RR-2026 | R★R Brand *Supplementary Price List* (Edition 5) — "Price update: selected items" | 10 | Text + images | w.e.f. 15-04-2026, 01-07-2026, 10-07-2026, 01-08-2026 (per section) | R★R Brand |
| RR-CT | R★R Brand *Carbide Cutting Tools* | 16 | Text-less PDF with embedded product images | w.e.f. 19-09-2026 | R★R Brand |
| MIRANDA | *Miranda Products Price List* DPM01052026 v3 | ~110 | **Text extract only (.txt) — original PDF not supplied** | Carbide tools 10-04-2026; HSS tools 01-05-2026 | Miranda — Dormer Pramet India Pvt. Ltd. |

RR-2026 explicitly says: "Pricing for all other items remains as per the Master Price List dated 15.01.2025" — so RR-2026 supersedes RR-2025 only for the items it lists. For the website this matters only for *which variants exist*, since prices are not shown.

## Top-level categories (proposed site structure)

| Slug | Site category | Sources | Main product groups found |
|---|---|---|---|
| machine-tool-accessories | Machine Tool Accessories | RR-2025, RR-2026 | BT-30/40/50, ISO-30/40/50, HSK-63A, CAT-40/50, SK-40, RBT-30/40, Morse taper (drawbolt & tang), R8/M1TR: ER / E-40 collet chucks, stub milling arbors (incl. flange type), side lock holders, milling reduction sockets, reduction adaptors, drill chuck arbors · ER, ERG tap, ERC sealed, ERS coolant, E-40, R8/M1TR, Traub, SDC, power-mill collets · collet & adaptor sets · drill sleeves, extension sockets, turret sleeves, quick change chucks, straight-shank baby collet chucks, nuts, spanners, pull studs, tool locking device, CNC spindle cleaner, GT quick-change tapping series, keyless / Ti-jaw / integral shank drill chucks, micro boring heads, CKB boring head chucks, master mandrel, flange type adaptor, edge finders, clamping kit, T-slot nuts, flange nuts |
| lathe-centres | Revolving & Dead Centres | RR-2025, RR-2026 ("Carbide Tipped Machine Tools") | Male revolving centres (standard, triple-bearing HD, four-bearing extra HD), CNC HD revolving centres, CNC HD R centre interchangeable, carbide tipped spare points, wedge, pipe revolving centres, dead centres, CNC dead centre with draw-off nut, special carbide tipped dead centre, full carbide dead centre, ejecting drifts |
| industrial-hand-tools | Industrial Hand Tools | RR-2025, RR-2026 | Adjustable tap handle, round die handle, engineer's precision try squares, expanding/adjustable hand reamers (Hv…H18), T-handle tap wrenches, protractor with graduated steel ruler, depth gauge, thread gauge, radius gauge |
| solid-carbide-tools | Solid Carbide Tools | RR-CT, MIRANDA | RR: solid carbide drill HRC55, spot drill 90°, square end mills (HRC45/55/65, 4F), key way end mill, end mill for aluminium, long neck end mill, ball nose end mills (HRC45/55, 2F/4F). Miranda: 2F/4F solid carbide end mills (std/long/extra long), ball nose, Premium Maxx Pro (45–60 HRC), SC jobber & stub drills, SC centre drills, SC reamers H7 |
| indexable-tooling | Indexable Tooling | RR-CT | BAP indexable end mill (AP11/AP16), BAP face mill cutter (AP16), EMR indexable end mill (RP10/RP12), EMR face mill cutter (RP12), EXN indexable end mill & face mill cutter (LNMU03), U-drill SPMG 2D/3D/4D |
| hss-cutting-tools | HSS Cutting Tools | MIRANDA | HSS toolbit blanks (square/round/flat, inch & mm, parting, Zedd P), HSS drills (jobber, stub, long, extra long, taper shank, centre, masonry, sets, TiN), HSS end mills & slot drills (M2/M42), HSS reamers H7, taper pin reamers, core drills, HSS & TCT annular cutters, HSS taps (metric coarse/fine, BSW, BSF, BA, UNC, UNF, pipe, helicoil, nib) |
| carbide-tipped-tools-burrs | Carbide Tipped Tools & Burrs | MIRANDA | Tungsten carbide tipped tools ISO 1–9 and 113–166 series (turning, facing, boring, parting, threading, recessing), tungsten carbide rotary burrs |

Customised / made-to-order sections (Miranda "Customised …" pages) will not become products — they have no fixed variants.

## Product + variant approach (Phase 3)

One product per catalogue table heading; variants = the table's rows/columns, e.g.
- **BT-50 ER Collet Chuck (DIN 6499)** → ER-16, ER-20, ER-25, ER-32, ER-40, ER-50 × lengths 100L/150L/200L/250L (ER-50 only 100L)
- **HSS Square Toolbit Blank (Inch)** → size rows × grades ZEDD, S100 (M35), S200 (M42), S400 (T42), S400E, S500 — only size/grade combinations that are listed (not "*") become variants
- **Male Revolving Centre (standard)** → MT-1 … MT-6

## Images

- RR-2025: product photos exist only inside the 300-dpi page scans → crop per product.
- RR-2026, RR-CT: product photos are embedded images → extract directly.
- MIRANDA: **no images available** (only text was supplied) → clean category placeholder until the PDF or photos are provided.

## Manual-review risks

- RR-2025 is a scan; small table text must be read from high-resolution renders, and anything unreadable will be flagged `needsReview` rather than guessed.
- Some Miranda tables lose column alignment in the text extract (e.g. merged cells, "*" = not available); these need care and may need the original PDF.

## Phase 2 status — data loaded so far

- **RR-2026 supplementary list: 39 products / 305 variants, all with real photos** (cut from the PDF, background removed).
  - Machine Tool Accessories 20 · Revolving & Dead Centres 10 · Industrial Hand Tools 9
- Categories still to be filled in Phase 3: Solid Carbide Tools, Indexable Tooling, HSS Cutting Tools, Carbide Tipped Tools & Burrs (and the rest of Machine Tool Accessories from RR-2025).
- Validation: `node scripts/validate-catalogue.mjs` (unique slugs/variant ids, images exist, no price data).

## Items for client review (copied as printed, not corrected)

| Product | Item |
|---|---|
| BT-50 Stub Milling Arbor | "(75L)" note for FMB-32 / FMB-40 is partly hidden under the table header in the PDF; site lists 75L as the shortest length for those two. |
| Expanding / Adjustable Hand Reamer | No. Hv capacity printed "1/2" – 9/32"" and H16 "1.13/16" – 1.7/32"" — likely typos (1/4"? 2.7/32"?). |
| T-Handle Tap Wrench | No. A capacity printed "1/6" – 3/16"" — possibly 1/16". |

## Phase 3 status — full catalogue loaded

| Source | Products | Notes |
|---|---|---|
| RR-2026 supplementary (01-08-2026) | 22 + centres merged | BT-50, nuts, collets, hand tools |
| RR-2025 master (15-01-2025, scanned) | 81 + 3 centres | Read from 300-dpi renders, every table checked by eye; ISO-30/40/50 merged into one product per type |
| RR centres (2025 plain + 2026 carbide tipped) | 12 | Plain & carbide tipped variants combined per centre type |
| RR-CT carbide cutting tools (19-09-2026) | 18 | OCR + visual check; U-drill has one variant per listed length (2D/3D/4D) |
| Miranda (text extract only) | 113 | Size rows where unambiguous; grades at product level; no photos |
| **Total** | **259 products · ~5,300 variants** | |

- Photos: 131 products have real photos cut from the R★R PDFs. 128 use the category placeholder (all 113 Miranda products + a few R★R items whose photo could not be identified with confidence).
- Products with no variant table: 28 (all flagged below or single-item products).
- Regenerate Miranda data: `python3 scripts/miranda/gen_mir.py` (needs the page-split text; see script header).

## Items flagged for review (not shown on the site)

| Product | Source | Note |
|---|---|---|
| BT-50 Stub Milling Arbor | RR-2026 p.2 | FMB-32/FMB-40 "(75L)" annotation is partly hidden under the table header in the PDF; read from the text layer. |
| R8 / M1TR ER Collet Chuck | RR-2025 p.11 | Thread printed as "7/18" UNF" — elsewhere on the page it is 7/16" UNF. Copied as printed. |
| Expanding / Adjustable Hand Reamer | RR-2026 p.9 | Capacities copied exactly as printed. Hv "1/2" – 9/32"" and H16 "1.13/16" – 1.7/32"" look like typos in the source (possibly 1/4" and 2.7/32") — confirm with the client. |
| T-Handle Tap Wrench | RR-2026 p.10 | No. A capacity printed as "1/6" – 3/16"" — possibly 1/16"; copied as printed. |
| HSS Intermediate Length Drill, Type N, 130° | MIRANDA p.23 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS Jobber Drill — Steam Tempered | MIRANDA p.23 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS Jobber Drill — TiN Coated | MIRANDA p.25 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS-E Jobber Drill — TiN Coated, DIN 338 | MIRANDA p.25 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS Parallel Shank Endmill — Long Series (M2 & M42) | MIRANDA p.44 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS Parallel Shank Roughing Endmill — M42 | MIRANDA p.44 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| HSS Parallel Shank Ball Nose Endmill | MIRANDA p.44 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| M42 TiAlN Coated Centre Cut Endmill | MIRANDA p.45 | Size rows read from the text extract; the section heading sits below the rows in the source text. |
| High Performance Tap — Miranda Edge Platinum Cut | MIRANDA p.79 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Tungsten Carbide Rotary Burr Set (5 pcs) | MIRANDA p.92 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| 2 Flute Solid Carbide End Mill | MIRANDA p.96 | Sizes for this and the 4-flute standard end mill share one page in the text extract and cannot be separated reliably. |
| 4 Flute Solid Carbide End Mill — Standard | MIRANDA p.96 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| 4 Flute Solid Carbide End Mill — Extra Long | MIRANDA p.98 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| 2 Flute Solid Carbide Ball Nose End Mill — Standard | MIRANDA p.98 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| 4 Flute Solid Carbide Ball Nose End Mill — Standard | MIRANDA p.99 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| 4 Flute Solid Carbide Ball Nose End Mill — Long | MIRANDA p.99 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Maxx Pro 4 Flute SC Square End Mill — Long Length (45–60 HRC) | MIRANDA p.102 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Maxx Pro 2 Flute SC Ball Nose — Standard Length (45–60 HRC) | MIRANDA p.102 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Maxx Pro 4 Flute SC Ball Nose — Standard Length (45–60 HRC) | MIRANDA p.103 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Maxx Pro 4 Flute SC Ball Nose — Long Length (45–60 HRC) | MIRANDA p.103 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |
| Solid Carbide Centre Drill 60° Countersink, Bright | MIRANDA p.109 | Size table shares a page with another product in the supplied text extract and could not be separated reliably — add sizes from the original Miranda PDF. |

## Phase 4 status — product page

- `/products/:slug` shows gallery, specifications, product details, size selector, enquiry panel, related products and a sticky enquiry bar.
- Selected size lives in the URL as `?variant=<id>` (shareable). WhatsApp / email messages list each attribute of the selected size (e.g. `Collet: ER-32`, `Length: 150L`), plus a link back to that exact size.
- R★R carbide cutting tools (RR-CT): dimensional size columns now carry "(mm)" — `Cut Ø (mm)`, `Shank Ø (mm)`, `Flute L (mm)` etc. — since every dimension in that catalogue is millimetres.
- "Listed in" row on each product names the source catalogue and page (never the word "price"). Remove it if the client prefers not to show it — one line in `product-detail.ts`.
- 28 products have no itemised sizes; their page says so and invites the visitor to send the size they need.

## Phase 5 status — Categories, About Us, Contact, Get A Quote

- **Get A Quote** (`/get-a-quote`): reusable `sti-quote-form` — Name (required), Company, Phone, Email, Product / Requirement, Quantity, Message.
  `?product=<slug>&variant=<id>` attaches the product and size (size can be changed or the product removed).
  Typing a catalogue product name and picking the suggestion attaches it. No backend: Send opens WhatsApp or the email app;
  the form says so. "Preview the message" shows the exact text. There is no "product code" field — the catalogues don't give codes.
- **Categories** (`/categories`): 7 category sheets with icon, photos, product/size counts, brand(s) and product-type links
  (`/products?category=…&type=…`). Jump bar at the top.
- **About Us** (`/about-us`): only verified facts — name, Since 1957, Kolkata address, and figures computed from the catalogue.
  No milestones, founders, awards or claims. "Years" is computed (current year − 1957).
- **Contact** (`/contact`): phone / WhatsApp / email / address cards with copy buttons, enquiry form, and a Google Map that
  loads only when the visitor clicks "Show map" (please check the pin lands on the right building).
- Brand red token darkened slightly (#de343f → #cf2f3a) so white-on-red buttons and red labels pass WCAG AA; logo colour unchanged.
- axe-core: 0 violations on Home, Products, Product, Categories, About, Contact, Get A Quote.

## Phase 6 status — visual refinement

- Shared `sti-whatsapp-button` / `sti-email-button` (components/enquiry-buttons) now drive every product enquiry button:
  product cards, the product page "Direct Enquiry" panel and the sticky enquiry bar. New global `.sti-btn--outline`, `--xl`, `--icon-mobile`.
- Phones: product cards switch to a compact horizontal layout (photo left) — the Products page is ~42% shorter; category cards
  become compact rows; home shows 4 featured products + "View all 259 products"; hero stats 2×2; footer links in two columns;
  mobile menu gains WhatsApp + Contact quick actions.
- Tablet: product photo centred when the product page stacks.
- Reduced motion: animation/transition delays now zeroed too (a hero callout previously stayed hidden for its delay).
- Consistency: "sizes" wording everywhere (cards said "variants"); one catalogue-wide size count (5,316) with thousands separators;
  "Photo to be added" placeholder wording everywhere.
- Footer quote band hidden on Home (ends with its own quote CTA) and on Get A Quote.
- 404 page lists all categories.

## Additions before Phase 7 (client request, 1 Oct 2026)

- **New products — R★R Brand "Hand Tools & Letter/Figure Punchings" list w.e.f. 01-06-2026, page 3 only** (`data/products/rr-ht.ts`):
  Marking Letter & Figure Punches (16 sizes × figure/letter set = 32), Dotted Letter & Figure Punches (8 × 2 = 16),
  Reverse Letter & Figure Punch Sets (5 × 2 = 10). Category: Industrial Hand Tools → type "Letter & Figure Punches".
  Photos cut out from page 3. Rates and the surcharge notes (loose pieces +50 %, satin finish +10 %) are not carried.
  **Review:** Reverse Sets list 5/32" as 5.0 mm (same as 3/16") — the mm value is left blank for 5/32" until confirmed.
  The notes "min 27 pcs for loose pieces" and "available in auto black & satin finish" are printed under Dotted Punches
  and are shown on that product only.
- **Business hours** (Mon–Fri 10 am–6 pm, Sat 10 am–5 pm, Sun closed) in `company.config.ts` → Contact, Get A Quote,
  About, footer, and schema.org opening hours.
- **Owner**: Huzefa Maimoon — "Meet the owner" section on About Us. Written only from what we know (name, role, the
  business's Kolkata / since-1957 facts and the site's purpose). No photo, background or dates were supplied, so none are shown.

## Phase 7 status — final QA & production

- Prerendering (Angular SSR, static output): 268 routes → static HTML with real titles, descriptions, canonical,
  Open Graph and JSON-LD, so search engines and WhatsApp link previews see each product. Pages hydrate in the browser.
- `sitemap.xml` + `robots.txt` generated at build from the catalogue and `COMPANY.siteUrl`.
- Hosting fallbacks included (`_redirects`, `.htaccess`); README has Nginx / Firebase / Vercel equivalents.
- Unit tests (19), full browser QA on 3 devices × 15 URLs, axe 0 violations, Lighthouse a11y/SEO/best-practices 100.

## Taparia Tools — Price List April 2026 (added 1 Oct 2026)

- **329 products, 2,808 sizes/variants** from every product table in the 44-page list (sections 1–55), in
  `src/app/data/products/taparia.ts` (generated by `scripts/taparia/gen_taparia.py` from `scripts/taparia/sections.json`).
- Transcribed page by page from the text layer and checked against each page image (rules: `scripts/taparia/TRANSCRIPTION-RULES.md`).
  Dropped: every price column, pack-size columns ("Std. Pkg."), blister/printed-bag packing split, surcharge/price notes.
- **Product No. is the first column of every size table**, so WhatsApp/email enquiries carry the exact Taparia code.
- Price columns that really meant options became a size-table column: Finish (phosphate / chrome plated) for adjustable
  wrenches and spanners; Material (BE-CU beryllium copper / AL-BR aluminium bronze) for all non-sparking tools —
  only where the list prices that option (a "-" means not offered).
- 296 products have a photo cut from the price list; 33 show the category placeholder.
- **New categories:** Pliers & Cutting Tools · Spanners, Wrenches & Keys · Sockets & Socket Sets · Screwdrivers, Bits & Testers ·
  Hammers, Chisels, Punches & Files · Workshop Equipment & Tool Kits · Cutting Wheels, Hole Saws & Drill Bits · Non-Sparking Tools.
  The earlier "Industrial Hand Tools" category (R★R) is now labelled **"Tapping, Measuring & Marking Tools"** (same URL).
- Obvious misprints corrected: "KNIEF" → Knife Files, "RABGE" → Range, "Fenale" → Female, "3.0 x 0..5" → 3.0 x 0.5.
- **For review (kept as printed):** HDC 121000 drill "12 x 740 x 1000" (740 probably 940); HSM 35 hole saw printed 1.1/4"
  like HSM 32; 7(AL) accessory "37636"; "Oxygen Bottle" (54 AM) is named "Non-Sparking Oxygen Bottle Key" from its photo;
  15(B) chrome and phosphated ribbed spanners kept as two products; 52(G)/52(H) cross-tip hammer drill tables merged.
