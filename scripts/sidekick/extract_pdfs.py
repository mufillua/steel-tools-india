#!/usr/bin/env python3
"""
Sidekick — step 1 of 2: read the supplier catalogues (PDF) into plain text, once.

    python scripts/sidekick/extract_pdfs.py <folder with the catalogue PDFs>

Writes scripts/sidekick/pdf-text/<doc>.json (one file per catalogue, text per page). Pages that have a text layer
are read directly; scanned pages are read with OCR (Tesseract). The output is committed, so step 2
(`npm run sidekick:train`) never needs Python, Tesseract or the PDFs. Re-run this only when a catalogue changes.

Needs: Python 3.10+, `pip install pymupdf`, and the `tesseract` program for scanned catalogues
(Windows: https://github.com/UB-Mannheim/tesseract/wiki). Without Tesseract, scanned pages are skipped with a warning.

Price lines and price-table rows are dropped here, so no supplier prices are ever stored in the repository, and
the lifting brochure's maker name is removed (client rule: never shown on the site). Step 2 then keeps only
descriptive sentences.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pymupdf

OUT = Path(__file__).resolve().parent / 'pdf-text'

# Which catalogue a file is, by its name. The doc ids match `SourceDoc` in src/app/models/product.model.ts.
DOCS = [
    (r'miranda', 'MIRANDA', 'Miranda products price list (May 2026)'),
    (r'taparia', 'TAPARIA', 'Taparia Tools price list (April 2026)'),
    (r'safe\s*lift|lifting', 'LIFTING', 'Lifting & material handling brochure'),
    (r'_CT_|\bCT\b', 'RR-CT', 'R★R Brand carbide cutting tools list (Sep 2026)'),
    (r'Revised|Edition', 'RR-2026', 'R★R Brand supplementary price list, edition 5 (Aug 2026)'),
    (r'NEW_FINAL|P_LIST', 'RR-HT', 'R★R Brand hand tools & punches list (June 2026)'),
    (r'2025', 'RR-2025', 'R★R Brand machine tools accessories master list (Jan 2025)'),
]

# The lifting brochure's maker name, including OCR splits ("Safel ift", "Sa fol ift") — never "safe lifting".
MAKER = re.compile(r'\bSa\s?f\s?[eo]?\s?l?\s?[lo]?\s?l?\s?i\s?f\s?t(?!\s?ing)[a-z]*|\bsaif\b', re.I)
# In the lifting brochure "Industries" is what is left of the maker's company name; web addresses are the maker's.
LIFTING_EXTRA = re.compile(r'\bn?industries\b|\bwww\.\S*', re.I)
TEXT_LAYER_MIN = 200  # characters; fewer means a scanned page


PRICE_LINE = re.compile(r'₹|\brs\.?\b|\bprices?\b|\bmrp\b|/-|\bnet rate\b|\bper (piece|pc|set|no)\b', re.I)
NUMBER = re.compile(r'\d+(?:[.,]\d+)*')


def strip_tables(text: str) -> str:
    """Keeps prose, drops price lists: any line mentioning a price, table rows (mostly numbers) and bare cells."""
    kept = []
    for line in text.splitlines():
        if PRICE_LINE.search(line):
            continue
        numbers = NUMBER.findall(line)
        letters = sum(c.isalpha() for c in line)
        if numbers and letters == 0:  # a bare table cell — PDF text often puts each cell on its own line
            continue
        digits = sum(c.isdigit() for c in line)
        if len(numbers) >= 2 and digits >= letters * 0.5:
            continue
        kept.append(line)
    return '\n'.join(kept)


def scrub(doc_id: str, text: str) -> str:
    """No prices (supplier price tables are never stored) and no lifting maker name."""
    text = strip_tables(MAKER.sub('', text))
    return LIFTING_EXTRA.sub('', text) if doc_id == 'LIFTING' else text


def doc_for(name: str) -> tuple[str, str]:
    for pattern, doc, title in DOCS:
        if re.search(pattern, name, re.I):
            return doc, title
    raise SystemExit(f'Unknown catalogue file: {name} — add it to DOCS in {__file__}')


def extract(path: Path, has_tesseract: bool) -> dict:
    doc_id, title = doc_for(path.name)
    pdf = pymupdf.open(path)
    pages = [None] * len(pdf)

    # The text layer is read in this thread (pymupdf is not thread safe); OCR runs in parallel.
    scanned = []
    for i in range(len(pdf)):
        text = pdf[i].get_text()
        if len(text.strip()) >= TEXT_LAYER_MIN:
            pages[i] = {'page': i + 1, 'method': 'text', 'text': scrub(doc_id, text)}
        else:
            scanned.append(i)
    if scanned and has_tesseract:
        images = {}
        for i in scanned:
            fd, png = tempfile.mkstemp(suffix='.png')
            os.close(fd)
            pdf[i].get_pixmap(dpi=300).save(png)
            images[i] = png

        def run(i: int) -> None:
            # --psm 4: one column of text of varying sizes — reads catalogue pages with tables best.
            out = subprocess.run(['tesseract', images[i], '-', '--psm', '4'], capture_output=True, text=True)
            pages[i] = {'page': i + 1, 'method': 'ocr', 'text': scrub(doc_id, out.stdout)}
            os.remove(images[i])

        with ThreadPoolExecutor(max_workers=os.cpu_count() or 2) as pool:
            list(pool.map(run, scanned))
    else:
        for i in scanned:
            pages[i] = {'page': i + 1, 'method': 'skipped', 'text': ''}

    return {'doc': doc_id, 'title': title, 'pages': pages}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    folder = Path(sys.argv[1])
    has_tesseract = shutil.which('tesseract') is not None
    if not has_tesseract:
        print('warning: tesseract not found — scanned catalogue pages will be skipped', file=sys.stderr)
    OUT.mkdir(exist_ok=True)
    for path in sorted(folder.glob('*.pdf')):
        data = extract(path, has_tesseract)
        target = OUT / f"{data['doc'].lower()}.json"
        target.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
        methods = {m: sum(p['method'] == m for p in data['pages']) for m in ('text', 'ocr', 'skipped')}
        print(f"{path.name} -> {target.name}: {len(data['pages'])} pages {methods}")


if __name__ == '__main__':
    main()
