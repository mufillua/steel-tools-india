# Sidekick — the product helper chatbot

Sidekick answers customer questions about the catalogue: what a tool is used for, how to use it, which sizes are
listed, specifications, where to find it on the site, and shop details. It runs **entirely in the visitor's browser**
— no external API, no AI service, no running cost — and it never quotes prices or names the lifting range's maker.

## How it works

```
supplier PDFs ──(1) extract_pdfs.py──► scripts/sidekick/pdf-text/*.json      (text of every page, OCR for scans)
                                              │
site catalogue (src/app/data) ──┐             ▼
tool-guide.json ────────────────┼──(2) train.mjs──► public/assets/sidekick/knowledge.json
synonyms.json ──────────────────┘             │        (+ exam: eval.json)
                                              ▼
visitor opens the chat ──► knowledge.json + catalogue ──► SidekickEngine (in the browser) ──► answer
```

- **Catalogue** (663 products, every size row, specs, features) — the same curated data the site shows, built from
  the R★R, Miranda, Taparia and lifting PDFs. No prices exist in it.
- **Tool guide** (`scripts/sidekick/tool-guide.json`) — a short "where it's used / how to use it / safety" note for
  each product *type* (158 entries, every product covered). The supplier price lists list sizes, not usage, so this is
  written as general workshop guidance; Sidekick labels it "General guidance". **Please read through it** and edit
  anything you want worded differently.
- **Catalogue sentences** — descriptive sentences pulled from the PDFs (e.g. Miranda's notes on reamers and core
  drills), each shown under the product its page was describing. Anything with a price, tax/terms text, contact
  details, the supplier talking about itself ("we", "our"), marketing claims, OCR noise, or the lifting maker's name
  is dropped. The lifting brochure prints two products side by side on each sheet, and OCR mixes their columns, so a
  sentence from it is only used when it names its own product (those products already carry their brochure
  features in the site data). Sentences ruled out after a read-through are listed in `passage-review.json`.
- **Hindi** (`synonyms.json` → `hindi`) — Hindi typed in English letters ("aapki dukaan kaha hai", "chain kuppi hai
  kya", "kaise use kare") or in Devanagari ("दुकान कहाँ है") is turned into English before the question is read: the
  longest listed phrase wins, "dukaan" and "dukan" match either way, and filler words ("ka", "ki", "hai") are dropped.
  Devanagari words that aren't listed are spelt out in English letters, so spelling correction still finds loanwords
  ("ड्रिल" → drill). Answers stay in English.
- **The company** — owner, year established, address, hours and contact details come from
  `src/app/config/company.config.ts`; product, category and brand counts from the catalogue; "years in business" is
  worked out from today's date. These are the same facts as the About page. Questions about things the site doesn't
  state (who founded the business, dealership status, GST or registration numbers) are passed to the team.
- **Synonyms** (`synonyms.json`) — customer words → catalogue words ("chain kuppi" → chain pulley block,
  "pallet jack" → pallet truck, "hex key" → Allen key, Hindi words like "pana", "pechkas"), plus `jobs` for
  "tools for an electrician / plumber / warehouse" questions.

The engine is search + templates, not a free-text AI: every sentence is either catalogue data or a prepared
template, so it cannot invent sizes, prices or brands. When it can't find something it says so and offers WhatsApp.

## Commands

| Command | What it does |
|---|---|
| `npm run sidekick:train` | Rebuilds `knowledge.json` and runs the exam (also runs automatically before every `npm run build`). |
| `npm run sidekick:ask -- "question" "follow-up"` | Asks Sidekick from the terminal, exactly as the site would answer. |
| `python scripts/sidekick/extract_pdfs.py <folder of PDFs>` | Only when a supplier catalogue changes: re-reads the PDFs (needs `pip install pymupdf` and Tesseract for scanned pages). Then run `npm run sidekick:train`. |

## Changing what Sidekick knows

- **New or changed products:** edit the catalogue data as usual; the next build retrains Sidekick. If the train
  report lists products "with no guide entry", add an entry to `tool-guide.json`.
- **Better wording for a tool:** edit its entry in `tool-guide.json`.
- **A word customers use that Sidekick doesn't understand:** add it to `synonyms.json` → `replace` (product words) or
  `hindi` (Hindi words and phrases, e.g. `["kab khulti hai", "opening time"]`).
- **A catalogue sentence that shouldn't be quoted** (wrong product, true of one version only): add its first few
  words to `passage-review.json` → `drop`, with the reason under `_why`, and retrain.
- **A question it answers badly:** add it to `eval.json` with the expected product/intent, fix the guide or synonyms,
  and retrain until the exam passes.

## Files

| Path | |
|---|---|
| `src/app/sidekick/engine/` | The answer engine (text normalising, search, intents, replies) + unit tests |
| `src/app/sidekick/launcher/` | The "Ask Sidekick" button (on every page; the only part in the main bundle) |
| `src/app/sidekick/panel/` | The chat window (loaded when first opened) |
| `src/app/sidekick/mascot/` | The Sidekick robot — an original SVG drawing with idle, wave, think and happy moods |
| `src/app/sidekick/sidekick.service.ts` | Conversation state (kept for the browser tab's session) |
| `scripts/sidekick/` | Extraction, training, exam, terminal `ask`, guide, synonyms, extracted PDF text |
| `public/assets/sidekick/knowledge.json` | The trained knowledge (≈104 KB, ≈30 KB compressed; loaded only when the chat opens) |

## Rules built in

- **No prices**: price questions get a WhatsApp / quote-form hand-off; every answer is also scrubbed for ₹ / Rs figures.
- **Lifting maker never named**: removed from the extracted text, the knowledge file and every answer (tested).
- **Never a dead end**: Sidekick never tells a customer "we don't have it". For anything not listed exactly it says
  *"For this product, please contact our team — they'll check and get back to you quickly"*, with a WhatsApp button
  (their request already written into the message) and a call button. Related products are shown only when they
  are the same kind of item (vernier caliper → calipers), never unrelated ones. A size that isn't printed gets
  "contact our team for this size", and the WhatsApp quote includes the size. The exam fails any answer that says
  we don't have something.
- **Honest matches**: "do you have X" only says yes when every word of the request matches a product.
- **Stock**: Sidekick says a product is *in the catalogue*; for stock and price it sends the customer to the team.
