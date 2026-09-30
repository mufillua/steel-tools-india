# Task: transcribe Taparia price-list tables into structured JSON (NO PRICES)

Source PDF: /root/.claude/uploads/39b43968-d4a5-5c70-9899-814b2b36510c/ee95e5ea-Taparia_Price_List_April_2026.pdf
- Printed page N (number printed at the page corner) = PDF page N+3. Use the Read tool with `pages` to SEE a page
  (e.g. printed page 1 → pages: "4"). Always look at the page image: it is the ground truth for structure.
- Exact text for each printed page is in /tmp/claude-0/-home-claude/39b43968-d4a5-5c70-9899-814b2b36510c/scratchpad/tap/page-<N>.txt
  (pdftotext -layout). Copy values from the text layer where it is clean; where text is garbled/doubled, read the image.
- An automatic (imperfect) table extraction is in raw.json in the same folder (entries keyed by "printed" page). Use it as a
  starting point only — headings are sometimes mis-assigned and multi-line headings truncated.

## What to produce
Write ONE JSON file (path given in your assignment) containing an array of **sections**, in reading order
(left column top→bottom, then right column top→bottom, page by page). A section = one lettered/numbered heading with a
product table, e.g. "2. (B) LONG NOSE PLIERS". Schema:

```json
{
  "page": 1,                        // printed page number where the section heading appears
  "id": "2(B)",                     // the heading number/letter, compact: "2(B)", "7(AD-1)", "4", "54(S)"
  "heading": "LONG NOSE PLIERS",    // full heading text as printed, without the number (join multi-line headings)
  "group": "PLIERS",                // parent group heading if there is one (e.g. "2. PLIERS", "3. SCREW DRIVERS"), else null
  "notes": ["Insulated with thick C.A. Sleeve", "Generally Confirming to IS 5658-1990"],
                                    // descriptive lines printed under the heading (material, sleeve, standard, finish…)
                                    // EXCLUDE "HSN Code …" and "Design No. …" (capture those in the fields below)
  "design_no": null,                // e.g. "178415" when printed, else null
  "hsn": "82032000",                // HSN code when printed, else null
  "is_new": false,                  // true if a "NEW" starburst badge is on the heading/table
  "columns": ["Product No.", "Description", "Length (mm)"],
  "rows": [["1421-6N", "Flat Nose", "160"], ["1430-6/1430-6N", "Long Nose", "170"]],
  "options": null,                  // see "Price columns that are really options" below
  "remarks": ["Order for loose pieces should be for min 27 pcs."],   // footnotes under the table that are NOT about price
  "row_notes": {"905 IBT": "20N + (1 N as a complimentary)"},        // optional: odd per-row packing notes — normally omit
  "flags": []                       // anything you are unsure about, in plain words
}
```

## Rules
1. **NO PRICES, EVER.** Drop every column whose header contains "Price", "₹", "Rs", "MRP", or "Rate". Drop footnotes about
   price, discounts, surcharges, "extra charged", GST etc.
2. Drop packing-quantity columns: "Std. Pkg.", "Standard Packing", "Std.Pkg.", "Pkg." (these are pack sizes, not specs).
3. Keep every other column (Product No., sizes, lengths, capacities, descriptions, contents, tip sizes, weights…).
   Use the header text as printed, cleaned: "Length (mm)", "Least Max. Opening (mm)", "Blade Dia. (mm)".
   Flatten two-level headers: "Tip Dimensions – Phillips", "Tip Dimensions – Flat (mm)".
4. **Product No. must be the first column** whenever the table has one. Copy product numbers EXACTLY
   (e.g. "1170/1170N", "P5 861 100", "260 - 1012" → keep the spacing as printed but collapse multiple spaces to one).
5. One row per product number. If a cell spans several rows (merged cell), repeat its value in each row.
   Empty / "-" / "—" / "----" cells → "—".
6. A table that continues in the next column or on the next page (same columns, no new heading, or the heading repeated)
   belongs to the SAME section: append its rows to that section (do not create a duplicate section). If the same heading is
   printed again with a DIFFERENT table layout (different columns), create a second section with the same id plus a
   suffix, e.g. "3(C)-2", and explain in flags.
7. **Price columns that are really options.** Some tables have several price columns that stand for different finishes or
   materials of the same product number (e.g. "Phosphate Finish" / "Chrome Plated"; "BE-CU" / "AL-BR" for non-sparking
   tools; "With Joint Cutter"). Do NOT copy any price, but record which options exist per row:
   ```json
   "options": {"axis": "Finish", "values": ["Phosphate finish", "Chrome plated"],
               "available": [[true, true], [true, false]]}   // one entry per row; false where the price cell is "-"
   ```
   Packing variants ("Blister Pkg." vs "Printed Bag Pkg.") are NOT options — ignore them completely.
   For non-sparking BE-CU / AL-BR use axis "Material", values ["Beryllium copper (BE-CU)", "Aluminium bronze (AL-BR)"].
8. Sets/kits: keep "Contents"/"Content" text exactly (it is valuable). Join line breaks with a space.
9. Do not invent anything. If something is unreadable, put your best reading and add a flag.
10. Headings like "3. SCREW DRIVERS" that only introduce sub-sections are groups, not sections (put them in "group" of
    the children). If a group heading has its own table directly under it, it IS a section.
11. Skip index pages, covers, terms & conditions, and anything that is only about prices/discounts.

Validate your file with `python3 -c "import json;d=json.load(open('<file>'));print(len(d))"` before finishing.
Final message: number of sections written, and a short list of flags/uncertainties (max 15 lines). Do not paste the JSON.
