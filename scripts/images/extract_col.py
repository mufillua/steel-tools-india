import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi

def find_column(arr, y0, y1):
    # columns where the mid band is mostly bg-gray (~225)
    band = arr[y0:y1, :, :].astype(int)
    g = (np.abs(band - 225).max(axis=2) < 6).mean(axis=0)
    xs = np.where(g > 0.35)[0]
    return xs.min(), xs.max()

def objects(path, y0=440, y1=3080, bg=225, tol=14, min_area=2500, gap=40):
    im = Image.open(path).convert('RGB'); arr = np.asarray(im)
    x0, x1 = find_column(arr, y0, y1)
    x0 += 6; x1 -= 6
    col = arr[y0:y1, x0:x1].astype(int)
    fg = np.abs(col - bg).max(axis=2) > tol
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_dilation(fg, iterations=gap // 2)
    lab, n = ndi.label(fg)
    out = []
    for sl in ndi.find_objects(lab):
        ys, xs = sl
        h, w = ys.stop - ys.start, xs.stop - xs.start
        if h * w < min_area: continue
        out.append((x0 + xs.start, y0 + ys.start, x0 + xs.stop, y0 + ys.stop))
    out.sort(key=lambda b: (b[1], b[0]))
    return im, out

if __name__ == '__main__':
    for p in sys.argv[1:]:
        im, boxes = objects(p)
        print(p, len(boxes), boxes)
