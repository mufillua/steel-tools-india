import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

def cutout(im, box, bg=225, tol=6, pad=24, out_max=900, keep='largest', smooth=3.0, erode=1):
    """Crop box from a page render, key out the flat grey background, return trimmed RGBA."""
    x0, y0, x1, y1 = [int(v) for v in box]
    rgb = im.crop((x0, y0, x1, y1)).convert('RGB')
    arr = np.asarray(rgb).astype(float)
    blurred = ndi.gaussian_filter(arr, sigma=(1.6, 1.6, 0))
    diff = np.abs(blurred - bg).max(axis=2)
    fg = diff > tol
    fg = ndi.binary_closing(fg, iterations=4)
    filled = ndi.binary_fill_holes(fg)
    # Re-open genuine see-through holes (e.g. a die-handle ring): large, flat, background-coloured.
    holes, nh = ndi.label(filled & ~fg)
    for i in range(1, nh + 1):
        h = holes == i
        if h.sum() > 900 and diff[h].mean() < tol * 0.5:
            filled[h] = False
    fg = ndi.binary_opening(filled, iterations=2)
    lab, n = ndi.label(fg)
    if n == 0:
        return None
    sizes = ndi.sum(fg, lab, range(1, n + 1))
    if keep == 'largest':
        mask = lab == (int(np.argmax(sizes)) + 1)
    else:
        mask = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.03 * sizes.max()])
    # smooth the silhouette so it follows the object, not the JPEG noise
    m = ndi.gaussian_filter(mask.astype(float), smooth) > 0.5
    if erode:
        m = ndi.binary_erosion(m, iterations=erode)
    alpha = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.9))
    rgba = rgb.convert('RGBA')
    rgba.putalpha(alpha)
    rgba = rgba.crop(alpha.getbbox())
    w, h = rgba.size
    canvas = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    canvas.paste(rgba, (pad, pad), rgba)
    canvas.thumbnail((out_max, out_max), Image.LANCZOS)
    return canvas
