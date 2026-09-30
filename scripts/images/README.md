# Product image pipeline

Product photos are cut from the supplied price-list PDFs (no stock images).

1. Render the PDF at 300 dpi: `pdftoppm -r 300 -png "RR Revised PL - 01.08.2026 - Edition 5.pdf" hi/rr26x`
2. `extract_col.py` finds the grey photo column on each page and detects each product photo.
3. `cutout.py` keys out the flat grey (#E1E1E1) background → transparent WebP with a smoothed edge.
4. `gen_rr26_images.py` maps each detected photo (page, order) to a product slug and writes
   `public/assets/products/<category>/<slug>.webp`.

Requires: `pip install pymupdf numpy scipy pillow`. The source photos in the PDF are small
(~240 px wide), so the WebPs are not upscaled beyond the 300-dpi render.
