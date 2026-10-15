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

## Lifting & material handling range (added 1 Oct 2026)

Source: the lifting & material handling brochure supplied on 1 Oct 2026 (35 pp, no text layer — read from 450-dpi crops).
72 products, 458 sizes in 5 new categories: Hoists, Pulley Blocks & Trolleys · Lifting Chain, Hooks & Rigging · Slings & Lashing ·
Lifting Clamps & Magnets · Material Handling Equipment. 71 have photos (cut out from the brochure; Wire Rope Pulley Block — Single Sheave has none).

**Brand:** by client request the brochure's maker / brand name is not shown anywhere on the site (no brand tag, no brand filter entry,
no "Listed in" catalogue name, no structured-data brand). Series names derived from the maker's name were reduced to "T Series" / "B Series".
Item codes are kept exactly as printed (several contain the letters "SL"). Photos may show the maker's name where it is printed on the product.

Editorial decisions:
- The T-series feature page (p. 1) and its table (p. 2) are one product. The electric-hoist feature page (p. 8) feeds both electric hoists.
- The sling-use pictogram page (p. 14) became a "Safe use" line on the webbing and round slings.
- Permanent Magnet Lifter: capacities 100–5000 are printed under "(T)" but are clearly kg — the unit is left off rather than shown wrongly.
- Round sling: three unlabelled columns, and Universal Plate Clamp: "NG (Catal)" / "Actual" columns were left out (meaning unclear).
- Obvious typos in headings were corrected (Shortner → Shortener, Conatiner → Container, Abbrassive → Abrasive, Reted → Rated …).

### Values to confirm with the supplier (copied as printed, flagged in `scripts/lifting/review.json`)

- **heavy-duty-chain-pulley-block-t-series** (p. 2): Printed 'Range' corrected to 'Range' and 'pinion shaft' corrected to 'pinion shaft' · Dimensions A-K have no unit printed (likely mm) · Extra Weight Per Meter of Extra Lift has no unit printed (likely kg) · Net Weight for 50 t printed as 1085 (looks inconsistent with other sizes, copied as printed) · Likely the spec page for the 'HEAVY DUTY CHAIN PULLEY BLOCK T SERIES' on PDF 4L
- **chain-pulley-block-revolve-series** (p. 3): Test Load column has no unit printed (values match tonnes) · Extra Weight Per Meter of Extra Lift has no unit printed · Item codes CBRL0103-CBRL1003 are identical to those used for the B SERIES table on PDF 5R
- **chain-pulley-block-b-series** (p. 4): Effort unit printed as 'KN' with values 330-410 (likely N; copied as printed) · Dimensions A-K have no unit printed · Extra Weight Per Meter of Extra Lift has no unit printed · Item codes CBRL0103-CBRL1003 duplicate those of the REVOLVE SERIES on PDF 5L
- **ratchet-lever-hoist** (p. 5): Printed 'Break' corrected to 'Brake' · 'Extra Weight /Mtr of Extra' label is truncated as printed and has no unit (likely kg)
- **gear-trolley** (p. 6): Dimensions A, B, C, H, F, M have no unit printed (likely mm) · 20 TON I-beam width '122-210' is lower than 10 TON's lower bound - copied as printed
- **pulling-lifting-machine-heavy-duty** (p. 7): Rated Forward Travel has no unit printed · Dimensions A-G have no unit printed (likely mm)
- **electric-chain-hoist-single-speed** (p. 9): Lifting speed for 3 t (5.4) is higher than for 2 t (3.3) - copied as printed
- **electric-chain-hoist-dual-speed** (p. 10): 0.3 t lifting speed second line printed '0.91-91' (likely '0.91-9.1') - copied as printed · Control Voltage printed '24V/36V/48/V' (stray slash) - copied as printed · Badge says '0.5TON~5TON' but table starts at 0.3 t
- **electric-trolley** (p. 11): Plate Thickness and I-Beam columns have no unit printed (likely mm) · No feature bullets on this page
- **polyester-duplex-webbing-sling** (p. 12): First column is the Single Upright WLL (P 1.0), used as the capacity identifier; colour moved to second column (colours repeat). No units printed for the WLL values (likely kg) · Row 20000: β 0°-7° = 60000, β 45° = 21000, 2-leg Upright 45° = 42000, Chocked 45° = 33600 do not match the coefficients (looks copied from the 30000 row) - copied as printed · Row 24000: Chocked 20000, β 0°-7° 50000, 7°-45° 35000, 45°-60° 25000, 45° 17500 etc. do not match the coefficients (look like 25000-based values) - copied as printed · Row 16000 colour printed Blue (out of sequence with Orange rows) - copied as printed · Single β column headed '45°' (last) and '45°- 60°' overlap as printed · Printed 'Non-conuctive' corrected to 'Non-conductive'
- **polyester-round-sling** (p. 13): Violet row has no values in the three unlabelled columns (written as —) · First column is the Single Upright WLL (P 1.0), used as the capacity identifier; colour moved to second column. No units printed for WLL values (likely kg) · Row 15000: β 0°-7° 40000, 7°-45° 28000, 45° 14000, 2-leg 28000/22400 do not match the coefficients - copied as printed · Row 20000: β 0°-7° 60000, β 45° 21000, 2-leg Upright 45° 42000, Chocked 45° 33600 do not match the coefficients - copied as printed · Row 25000: β 0°-7° 50000 does not match coefficient 2.0 - copied as printed · Row 15000 colour printed Blue among Orange rows - copied as printed · No feature bullets on this page
- **anti-abrasive-sling-sleeve** (p. 14): Heading printed 'Anti Abrasive' (likely 'Anti Abrasive') - kept as printed · No spec table
- **anti-cutting-sling-sleeve** (p. 14): Text says 'resistant to cutting' (probably meant 'resistant to cutting') - copied as printed · No spec table
- **sling-edge-protector** (p. 14): No spec table
- **cargo-lashing-ratchet** (p. 15): Two rows with webbing width 50 (3000/6000 and 5000/10000) - no item codes to distinguish them
- **g80-alloy-steel-lifting-chain** (p. 16): Item code for 6.3 chain printed 'LCSL8063' (pattern of others suggests e.g. 'LCSL0863') - copied as printed · Chain dimension columns (INN Length, Outer Length, INN Width, Outer Width) and Chain Size have no unit printed (likely mm) · Endless Choking blank for 36 and 40 mm (written as —) · WLL table chain sizes (6,7,8,10,13,16,20,22,26,32,36,40) differ from main table sizes · 'Quadruple' printed (likely 'Quadruple') - kept as printed
- **screw-pin-dee-shackle** (p. 17): W.L.L column has no unit printed (likely tonnes); C, D, L, W have no unit printed (likely mm) · Sizes such as '1.1/8' are printed with a dot meaning 1-1/8 - copied as printed
- **nut-bolt-dee-shackle** (p. 18): W.L.L column has no unit printed (likely tonnes); C, D, L, W have no unit printed (likely mm) · 55 t row: C (Body) 70.5 is larger than D (Pin) 66.1, unlike all other rows - copied as printed
- **screw-pin-bow-shackle** (p. 19): W.L.L column has no unit printed (likely tonnes); d, D, L, W, B have no unit printed (likely mm)
- **nut-bolt-bow-shackle** (p. 20): W.L.L column has no unit printed (likely tonnes); d, D, L, W, B have no unit printed (likely mm) · 150 t row L (Inn Length) 365 is smaller than the 120 t row (375) - copied as printed
- **g100-shortening-hook-assembly-master-link-2-leg** (p. 21): Last item code printed as 'MI021014' (capital I, not L) unlike the others 'ML0210..' — copied as printed, likely typo for ML021014 · Dimension unit not printed (assumed mm)
- **g100-shortening-hook-assembly-master-link-4-leg** (p. 21): Last item code printed as 'MI041021' (capital I) unlike the others 'ML0410..' — copied as printed, likely typo for ML041021 · Dimension unit not printed (assumed mm)
- **g100-webbing-sling-hook-100-wk** (p. 22): Feature text printed 'maganaflux' — corrected to 'magnaflux' · No unit printed for dimensions or B.L. (presumably mm and t)
- **g80-eye-sling-hook** (p. 23): No units printed for W.L.L, dimensions or Weight (presumably t, mm, kg) · Drawing labels ϕ1 but table has Q1/Q columns
- **g80-clevis-sling-hook** (p. 24): W.L.L for CHSL0805 (12 mm) printed as '53' — almost certainly a typo for 5.3; copied as printed · Rows CHSL0812 and CHSL0815 look column-shifted versus the rows above (B and E both 71 / both 95; H 175/210 fits E's trend) — copied exactly as printed · No units printed for W.L.L, dimensions or WEIGHT (presumably t, mm, kg)
- **g80-eye-self-locking-hook** (p. 25): No units printed for dimensions or WEIGHT (presumably mm, kg) · SLHSL812 E=77.5 is smaller than SLHSL088 E=78.3, and SLHSL815 R=77 smaller than SLHSL812 R=96 — copied as printed
- **g80-clevis-self-locking-hook** (p. 26): No units printed for Ton, Chain size, B.L or dimensions (presumably t, mm, t, mm)
- **g80-swivel-self-locking-hook** (p. 27): No units printed for Ton, dimensions or WEIGHT (presumably t, mm, kg)
- **g80-swivel-eye-hook** (p. 28): Sub-heading 'Screw Pin Bow Shackle' printed under the heading looks like a leftover/mismatch for a swivel eye hook — copied as printed · No units printed for Capacity, dimensions or WEIGHT (presumably t, mm, kg)
- **g80-eye-grab-hook** (p. 29): GHSL0805 C=195.5 is larger than GHSL0808 C=167 — copied as printed · Item codes GHSL0801–GHSL0815 are the same codes used for G80 CLEVIS SHORTENING GRAB HOOK on the next page · No units printed for W.L.L, dimensions or WEIGHT (presumably t, mm, kg)
- **g80-clevis-shortening-grab-hook** (p. 30): Chain Size for GHSL0802 printed '7/8' (likely meaning 7 or 8 mm, written '7,8' elsewhere) · GHSL0815 L=152 is smaller than GHSL0812 L=215.7 — copied as printed · Item codes GHSL0801–GHSL0815 duplicate the codes of G80 EYE GRAB HOOK on the previous page · Chain size 13 mm for 5.3 t here vs 12 mm on the eye grab hook — copied as printed
- **g80-foundry-hook** (p. 31): Table column 'Q' is not labelled on the drawing (drawing shows G instead) · FHSL0808 Q=32.3 is smaller than FHSL0805 Q=39.5 — copied as printed · No units printed for Capacity, dimensions or WEIGHT (presumably t, mm, kg)
- **g80-container-lifting-hook** (p. 42): No units printed for W.L.L or dimensions (presumably t and mm) · Feature text printed 'fo 20000 cycles' corrected to 'for'
- **g80-master-link** (p. 32): Column 'L' is not labelled on the drawing · No units printed for W.L.L, dimensions or Weight (presumably t, mm, kg)
- **g80-master-link-assembly** (p. 33): MLASL804 2nd-group B (33.7) is smaller than MLASL803's (37.4) — copied as printed · No units printed for W.L.L, dimensions (presumably t, mm) · Item codes MLASL804–MLASL826 also appear on the next page (enlarged sublinks version) with different W.L.L/dimensions
- **g80-master-link-assembly-enlarged-sublinks** (p. 34): Item codes MLASL804–MLASL826 duplicate codes on the previous page (standard master link assembly) with different values · MLASL821 W.L.L 23.6 vs MLASL826 W.L.L 31.5 — code suffix 826 does not match 31.5 (on the previous page MLASL826 = 26.5) — copied as printed · MLASL821 a=275 is larger than MLASL826 a=185 — copied as printed · No chain size column; no units printed for W.L.L or dimensions (presumably t, mm)
- **g80-chain-connecting-link** (p. 35): Column headed 'W.L.L' contains 6, 8, 10 … 32 which match the item-code suffixes and look like chain sizes (mm), not working load limits — copied as printed · No units printed for dimensions (presumably mm)
- **g80-webbing-connecting-link** (p. 35): Table has both 'Capacity (T)' (2/3/5) and 'W.L.L (T)' (3.15/5.3/8.0) with different values — copied as printed
- **g80-chain-shortener** (p. 36): Heading spelled 'SHORTNER' (as printed; probably 'SHORTENER') · No units printed for dimensions (presumably mm)
- **regular-swivel** (p. 36): No units printed for dimensions or Weight (presumably mm, kg)
- **weld-on-ring** (p. 37): Second bullet is cut off in print as 'Working Load Lim' — completed to 'Working Load Limit' · WRSL0815 and WRSL0820 both have B=270 — copied as printed · No units printed for dimensions (presumably mm)
- **g80-weld-on-hook** (p. 37): WHSL0802 L=81.5 is smaller than WHSL0801 L=89.1, and WHSL0805 first A=11 is smaller than WHSL0803's 13 — copied as printed · No units printed for dimensions or Weight (presumably mm, kg)
- **galvanised-heavy-duty-wire-rope-clamp** (p. 38): UBSLGI20 G printed as '735' (no decimal point visible) — almost certainly 73.5; copied as printed · UBSLGI45 C=70 is smaller than UBSLGI40 C=81, and UBSLGI45 G=137 smaller than UBSLGI40 G=150 — copied as printed · Item codes use 'GI' (letters G, I), read as UBSLGI
- **eye-bolt-din-580-galvanised** (p. 39): M12 W.L.L (O deg) printed as '1.34' — out of sequence (M16 is 0.7); likely 0.34 — copied as printed · M56 D2 printed as '100', smaller than M42's 144 — copied as printed · No units printed for dimensions (presumably mm)
- **g80-rotating-lifting-eye-bolt** (p. 40): Item code RBSL0830 appears twice (M30 at 5.3 and M30 at 8) with different dimensions — copied as printed · No unit printed for Capacity or dimensions (presumably t, mm) · M48 row (10 t, A 92, weight 4.2) is smaller than M42 row — copied as printed
- **drop-forged-galvanised-turnbuckle-jaw-and-jaw** (p. 41): Table prints no units for Capacity or the lettered dimensions (presumably t and mm); columns left without units · Size '1.1/4x12”' printed without the inch mark after 1.1/4 (copied as printed)
- **wire-rope-edge-protector-with-magnet** (p. 42): No unit printed for dimensions A and B (presumably mm)
- **cable-puller** (p. 43): Capacity 4 row has item code CPSL0050 (not CPSL0040) and shorter rope 2.5 m — copied as printed · 'Description' merged cell 'Cable Puller' visually spans the first three rows; the 4th row's cell appears blank but repeated here
- **permanent-magnet-lifter** (p. 44): No unit printed for dimensions L, B, H, R (presumably mm)
- **ratchet-load-binder** (p. 46): Feature text printed 'Continues take-up' corrected to 'Continuous'
- **wire-rope-pulley-block-single-sheave** (p. 47): Row for Size 1 (WRPSL101) has all values blank as printed · No units printed in table (Size presumably t; dimensions presumably mm; Weight presumably kg)
- **wire-rope-pulley-block-double-sheave** (p. 47): Heading says 'DOUBLE SLEEVE' (likely 'double sheave'); kept as printed · No units printed in table (Size presumably t; dimensions presumably mm; Weight presumably kg)
- **manila-rope-pulley** (p. 48): Drawing labels 'T2' but table column is 'T1' — copied as printed · No units printed for dimensions (presumably mm); (S)/(D) presumably single/double sheave
- **horizontal-plate-lifting-clamp-pdb-type** (p. 49): No units printed for Capacity, dimensions or Jaw Opening (presumably t and mm) · 'PDB TYPE' printed as second line of heading; treated as part of name
- **lateral-plate-clamp** (p. 49): 12 t model (LPLCSL12) has only an item code; all other values blank as printed · Net Weight row has values only under the 2 t (7.1) and 3 t (12.1) columns; others blank — alignment may be off in the source · Dimension F for 10 t printed '18' (out of sequence with 60/75/90/100) — copied as printed · Dimension A row sits outside the 'Dimensions (mm)' label block; mm assumed · Jaw Opening has no unit printed
- **vertical-plate-lifting-clamp** (p. 50): No units printed for Capacity, dimensions or Jaw Opening (presumably t and mm)
- **universal-plate-lifting-clamp** (p. 50): Dimension G for 2 t printed '69.251' (odd precision) — copied as printed · Columns 'NG (Catal)' and 'Actual' are unexplained in the source; 3 t row blank in both · No units printed for Capacity or lettered dimensions (presumably t and mm)
- **pipe-lifting-clamp-tph-type** (p. 51): Rows printed out of capacity order (3, 6, 1.5, 8, 10) — kept in printed order · No units printed for Capacity or dimensions (presumably t and mm) · 'TPH TYPE' printed as second line of heading; treated as part of name
- **beam-clamp** (p. 51): A Max for 2 t (170) is smaller than for 1 t (175) — copied as printed · No units printed for Capacity or dimensions (presumably t and mm)
- **scissor-lift-pallet-truck** (p. 52): Self weight printed without unit (presumably kg)
- **hand-pallet-truck** (p. 53): Printed page 54 (pdf 30R) has no separate product — its heading is a feature line and its content was merged into HAND PALLET TRUCK · Typos corrected in features: 'pump until' → 'pump unit', 'pulling effort' → 'pulling effort', 'power coating' → 'powder coating'; 'non-marking properly' and 'All pivots points' left as printed
- **rough-terrain-truck** (p. 55): Rear Wheel Dia x Width printed as single value '250' — copied as printed
- **drum-trolley** (p. 56): Item code suggests 400 but capacity printed 300 kg — copied as printed
- **drum-lifter-cum-tilter** (p. 57): Feature text printed 'precision' corrected to 'precision'; two sentences split over separate printed lines were joined · Table gives both Self weight 160 kg and Net Weight 155 kg, and Overall dimension height 2000 vs Overall Height 2020 — copied as printed
- **hand-stacker** (p. 58): Lifting speed blank for HHSSL116 as printed
- **electric-stacker** (p. 59): Wheel dimensions printed '±80x93' and '±180x50' — the '±' is probably meant to be 'φ' (diameter); copied as printed · Battery charger printed 'AC22oV' (letter o, likely 220V) — copied as printed · Callout 'Curtis Controller' likely means 'Curtis Controller' — kept as printed
- **wire-mesh-container** (p. 60): Heading printed 'WIRE MESH CONTAINER' (typo for 'CONTAINER') — kept as printed
