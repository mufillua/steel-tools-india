"""
Generate src/app/data/products/taparia.ts (+ product photos) from the transcribed Taparia sections.

Input : sections JSON transcribed from "Taparia Price List April 2026" (price and pack-size columns already dropped)
Output: src/app/data/products/taparia.ts, public/assets/products/<category>/tap-*.webp

Usage: python3 scripts/taparia/gen_taparia.py scripts/taparia/sections.json scripts/taparia/imgmap.json "<Taparia Price List April 2026.pdf>"
"""
import json, re, sys, os
from collections import Counter, defaultdict

SRC, IMGMAP, PDF = sys.argv[1], sys.argv[2], sys.argv[3]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S = json.load(open(SRC))
IM = json.load(open(IMGMAP))

# Tables that the price list prints under two headings but are one product (same heading, same columns).
MERGE = {'52(H)': '52(G)'}
_by_id = {x['id']: x for x in S}
for src, dst in MERGE.items():
    if src in _by_id and dst in _by_id and _by_id[src]['columns'] == _by_id[dst]['columns']:
        _by_id[dst]['rows'] += _by_id[src]['rows']
        _by_id[dst]['flags'] = (_by_id[dst].get('flags') or []) + (_by_id[src].get('flags') or [])
        S = [x for x in S if x['id'] != src]

# ---------------------------------------------------------------- categories & types
def num(sid): return int(re.match(r'\d+', sid).group(0))
def letter(sid):
    m = re.match(r'\d+\(([A-Z0-9\-]+)\)', sid); return m.group(1) if m else ''

CAT_BY_NUM = {}
for c, nums in {
    'pliers-cutting-tools': [2, 4, 23, 24, 26, 27, 55],
    'spanners-wrenches': [1, 8, 9, 14, 15, 16, 17, 18, 19, 29, 36],
    'sockets-accessories': [7],
    'screwdrivers-bits': [3, 6],
    'hammers-chisels-files': [10, 20, 21, 25, 53],
    'workshop-equipment': [5, 11, 12, 13, 22, 28, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 51],
    'power-tool-accessories': [44, 45, 46, 47, 48, 49, 50, 52],
    'non-sparking-tools': [54],
}.items():
    for n in nums: CAT_BY_NUM[n] = c

def drive(h):
    h = h.replace(' ', '')
    for k, v in [('6.3mm', '1/4"'), ('1/4', '1/4"'), ('9.5mm', '3/8"'), ('3/8', '3/8"'), ('12.7mm', '1/2"'), ('1/2', '1/2"'),
                 ('19mm', '3/4"'), ('3/4', '3/4"'), ('25.4mm', '1"')]:
        if k in h: return v
    return None

def subcategory(s):
    n, l, h = num(s['id']), letter(s['id']), s['heading'].upper()
    if n == 2:
        if l in ('K', 'L'): return 'Pincers'
        if l == 'O': return 'Nippers'
        if l in ('R', 'S'): return 'Wire Strippers'
        return 'Pliers'
    if n == 55: return 'Pliers'
    if n == 3:
        if l in ('S', 'T', 'U'): return 'Line Testers'
        if l in ('P', 'Q', 'R', 'V'): return 'Screwdriver Sets & Kits'
        return 'Screwdrivers'
    if n == 6:
        if l in ('H', 'I', 'L'): return 'Bit Drivers'
        if l in ('J', 'K', 'M'): return 'Bit Sets'
        return 'Screwdriver Bits'
    if n == 7:
        if l in ('P', 'AM'): return 'Socket Wrenches'
        d = drive(s['heading'])
        return f'{d} Drive Sockets' if d else 'Sockets'
    fixed = {1: 'Adjustable Wrenches', 4: 'Crimping Tools', 5: 'Insulation Tapes', 8: 'Torque Wrenches', 9: 'Pipe Wrenches',
             10: 'Hammers', 11: 'Clamps', 12: 'Clamps', 13: 'Vices', 43: 'Vices', 14: 'L, Box & Tubular Spanners',
             15: 'Open Jaw Spanners', 17: 'Open Jaw Spanners', 16: 'Ring Spanners', 18: 'Combination Spanners',
             19: 'Slugging Spanners', 20: 'Chisels', 21: 'Punches', 22: 'Magnetic Tools', 23: 'Cutters', 24: 'Cutters',
             25: 'Axes', 26: 'Pipe Cutters & Knives', 27: 'Hacksaws', 28: 'Bearing Pullers', 29: 'Allen & Torx Keys',
             30: 'Tool Bags', 31: 'Tool Bags', 32: 'Tool Bags', 33: 'Tool Kits', 34: 'Tool Boxes & Trolleys',
             35: 'Tool Boxes & Trolleys', 36: 'Filter Wrenches', 37: 'Oil & Grease Pumps', 38: 'Jacks', 39: 'Jacks',
             40: 'Carpenter Tools', 41: 'Riveters', 42: 'Spirit Levels', 44: 'Diamond Cutting Blades',
             45: 'Tile Cutter Blades', 46: 'Granite Blades & Cup Wheels', 47: 'Wood Cutting Blades', 48: 'Cut-Off Wheels',
             49: 'Abrasives', 50: 'Hole Saws', 51: 'Chalk Line', 52: 'Drill Bits', 53: 'Files'}
    if n == 40 and l == 'I': return 'Calipers & Dividers'
    if n == 54:
        groups = {'Pliers': 'BCDEFG', 'Hammers & Chisels': ['H', 'U', 'AA'], 'Screwdrivers': 'ST', 'Hacksaws': 'XY',
                  'Files': ['AN', 'AO', 'AP', 'AQ', 'AR']}
        for g, ls in groups.items():
            if l in ls: return f'Non-Sparking {g}'
        if l in ('AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL'): return 'Non-Sparking Sockets & Accessories'
        return 'Non-Sparking Spanners & Wrenches'
    return fixed[n]

# ---------------------------------------------------------------- names
KEEP = {'VDE', 'PVC', 'SDS', 'HSS', 'TCT', 'CC', 'II', 'UK-3', 'IS', 'A/F', 'BE-CU', 'AL-BR', 'SQ.', 'DR.', 'T', 'L', 'C', 'F', 'E'}
SMALL = {'AND', 'WITH', 'FOR', 'OF', 'IN', 'ON', 'THE', 'TO', 'OR', 'WITHOUT'}
TYPO = {'KNIEF': 'KNIFE', 'RABGE': 'RANGE'}

def tc_word(w, first):
    core = re.sub(r'^[\(\[]+|[\)\],:.]+$', '', w)
    if not core or any(ch.islower() for ch in core) or any(ch.isdigit() for ch in core):
        return w.replace('MM', 'mm') if re.search(r'\dMM', w) else w
    up = core.upper()
    up = TYPO.get(up, up)
    if up in KEEP: new = up if up not in ('SQ.', 'DR.') else up.capitalize()
    elif up.rstrip('.') in {'PCS', 'SQ', 'DR'}: new = up.capitalize()
    elif up in SMALL and not first: new = up.lower()
    else: new = '-'.join(p.capitalize() for p in up.split('-'))
    return w.replace(core, new)

def title(h):
    h = re.sub(r'\s+', ' ', h).strip().rstrip('.')
    words = h.split(' ')
    return ' '.join(tc_word(w, i == 0) for i, w in enumerate(words))

NAME_OVERRIDE = {
    '2(H)': 'Mini Pliers (Two Colour Dip Coated Sleeve)',
    '8(B)': 'Torque Wrenches Ratchet Type (Professional Range)',
    '27(B)': 'Hacksaw Blades — Carbon Steel All Hard',
    '27(C)': 'Flexible Hacksaw Blades (Carbon Steel)',
    '27(D)': 'Hacksaw Blades — Carbon Steel (Double Side Cutting)',
    '27(E)': 'Hacksaw Blades — Bi-Metal',
    '54(AM)': 'Non-Sparking Oxygen Bottle Key',
    '7(Q)': 'Spark Plug Sockets - 12.7mm (1/2) Square Drive (CrV)',
    '29(B)': 'Allen Keys - Brown Finish (Inch)', '29(D)': 'Allen Key Sets - Brown Finish (Inch)',
    '29(G)': 'Allen Keys - Black Finish (Inch)', '29(H)': 'Allen Key Sets - Black Finish (mm)',
    '29(I)': 'Allen Key Sets - Black Finish (Inch)', '29(J)': 'Allen Keys Long Ball Point (Inch)',
    '29(L)': 'Allen Key Long Ball Point Set (Inch)', '29(N)': 'Allen Keys Extra Long Ball Point (Inch)',
    '29(O)': 'Allen Key Extra Long Ball Point Set (mm)', '29(P)': 'Allen Key Extra Long Ball Point Set (Inch)',
    '29(T)': 'T-Handle Hex Keys (mm)', '29(V)': 'T-Handle Hex Keys (Inch)',
    '29(R)': 'Torx Key Sets (Short Series)', '29(S)': 'Folding Type Keys Set',
    '3(V)': 'Screw Driver Kits',
    '48(C)': 'Cut Off Wheel (Gold Series) — 4 Green 2 Net', '48(D)': 'Cut Off Wheel (Silver Series) — 4 Green 2 Net',
    '54(W)': 'Non-Sparking Allen Keys (Inch)',
    '54(AC)': 'Non-Sparking 12.7mm (1/2) Square Drive Socket Set (28 Pcs.)',
    '54(AD)': 'Non-Sparking 12.7mm (1/2) Square Drive Socket Set (32 Pcs.)',
    '54(AF)': 'Non-Sparking 19mm (3/4) Square Drive Socket Set (15 Pcs.)',
    '54(AG)': 'Non-Sparking 19mm (3/4) Square Drive Socket Set (20 Pcs.)',
    '54(AH)': 'Non-Sparking Socket Accessories - 9.37mm (3/8), 12.7mm (1/2), 19mm (3/4)',
    '53(K)': 'Flat Super Light Files', '53(M)': 'Pit Saw Files',
}
def base_name(s):
    if s['id'] in NAME_OVERRIDE: return NAME_OVERRIDE[s['id']]
    n = title(s['heading'])
    g = (s.get('group') or '').upper()
    if num(s['id']) == 44: n = f'Diamond Cutting Blade — {n}'
    if num(s['id']) == 45: n = f'Tile Cutter Blade — {n}'
    if num(s['id']) == 54: n = f'Non-Sparking {n}'
    n = re.sub(r'\s*:\s*(Hanger|Blister) Pkg\.?', '', n)
    n = re.sub(r'(\d)\s*Mm\b', r'\1mm', n).replace(' Mm ', ' mm ')
    return n

def clean_note(t):
    t = t.strip()
    t = re.sub(r'^\((.*)\)$', r'\1', t)
    t = t.replace('withOUT', 'without').replace('Confirming', 'conforming')
    t = re.sub(r'\s+', ' ', t)
    if t.isupper(): t = t.capitalize()
    return t

def is_banner(t):
    u = t.upper()
    return 'HSN CODE' in u or u.startswith('BE-CU') or u.startswith('AL-BR') or 'NON SPARKING TOOLS WILL' in u

COL_FIX = {'Content / Drill Size – Dia. X Working Length X Total Length (mm)': 'Contents', 'Weigh (Gms)': 'Weight (gms)',
           'Size/ Type': 'Size / Type', 'Content': 'Contents', 'Weight (grms)': 'Weight (gms)', 'Std.Pkg.': None}

names = {s['id']: base_name(s) for s in S}
# disambiguate duplicates with the section's first descriptive note, else its catalogue section
cnt = Counter(names.values())
for s in S:
    n = names[s['id']]
    if cnt[n] > 1:
        notes = [clean_note(x) for x in s['notes'] if not is_banner(x) and 'conforming' not in clean_note(x).lower()]
        if notes and len(notes[0]) < 50: names[s['id']] = f'{n} ({notes[0][0].upper() + notes[0][1:]})'
cnt = Counter(names.values())
for s in S:
    if cnt[names[s['id']]] > 1: names[s['id']] = f"{names[s['id']]} — Series {s['id']}"

def slugify(x):
    x = x.lower().replace('"', 'in').replace('&', 'and').replace('—', '-')
    return re.sub(r'[^a-z0-9]+', '-', x).strip('-')

used = set()
def mkslug(name):
    base = 'taparia-' + slugify(name)[:70].rstrip('-')
    s, i = base, 2
    while s in used: s, i = f'{base}-{i}', i + 1
    used.add(s); return s

# ---------------------------------------------------------------- images
import pymupdf
from PIL import Image
sys.path.insert(0, os.path.join(ROOT, 'scripts', 'images'))
import numpy as np
from scipy import ndimage as ndi
doc = pymupdf.open(PDF)

def key_white(im):
    """Remove the flat photo background (sampled from the image border) while keeping internal highlights."""
    rgb = im.convert('RGB'); a = np.asarray(rgb).astype(float)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    diff = np.abs(a - bg).max(axis=2)
    fg = diff > 18
    fg = ndi.binary_closing(fg, iterations=3)
    fg = ndi.binary_fill_holes(fg)
    fg = ndi.binary_opening(fg, iterations=1)
    lab, n = ndi.label(fg)
    if n:
        sizes = ndi.sum(fg, lab, range(1, n + 1))
        fg = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v > 0.06 * sizes.max()])
    fg = ndi.binary_erosion(fg, iterations=1)   # drop the light JPEG fringe around the edge
    alpha = Image.fromarray((ndi.gaussian_filter(fg.astype(float), 0.7) * 255).clip(0, 255).astype('uint8'))
    out = rgb.convert('RGBA'); out.putalpha(alpha); return out

# Photos that did not survive extraction cleanly (flat grey shapes / cropped) — placeholder instead.
EXCLUDE_IMG = {'7(Q)', '7(V)', '3(R)'}

def extract(section, dest):
    if section['id'] in EXCLUDE_IMG: return None
    v = IM.get(section['id'])
    if not v or not v['imgs']: return None
    page = doc[section['page'] + 2]
    target = pymupdf.Rect(v['imgs'][0])
    best = None
    for info in page.get_image_info(xrefs=True):
        r = pymupdf.Rect(info['bbox'])
        if abs(r.x0 - target.x0) < 1 and abs(r.y0 - target.y0) < 1 and info['xref']:
            best = info; break
    if not best: return None
    pix = pymupdf.Pixmap(doc, best['xref'])
    if pix.n - pix.alpha >= 4: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    im = Image.frombytes('RGBA' if pix.alpha else 'RGB', (pix.width, pix.height), pix.samples)
    smask = doc.xref_get_key(best['xref'], 'SMask')
    if smask[0] == 'xref':
        m = pymupdf.Pixmap(doc, int(smask[1].split()[0]))
        mask = Image.frombytes('L', (m.width, m.height), m.samples).resize(im.size)
        im = im.convert('RGBA'); im.putalpha(mask)
    elif not pix.alpha:
        im = key_white(im)
    im = im.convert('RGBA')
    bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bb: return None
    im = im.crop(bb)
    if im.width < 60 and im.height < 60: return None
    pad = max(12, int(max(im.size) * 0.04))
    canvas = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); canvas.paste(im, (pad, pad), im)
    canvas.thumbnail((900, 900), Image.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    canvas.save(dest, 'WEBP', quality=84, method=6)
    return True

# ---------------------------------------------------------------- products
def short(v):
    m = re.search(r'\(([A-Z]{2}-[A-Z]{2})\)', v); return m.group(1) if m else v

def range_of(vals):
    vals = [v for v in vals if v and v != '—']
    uniq = list(dict.fromkeys(vals))
    if not uniq: return None
    if len(uniq) == 1: return uniq[0]
    if all(re.fullmatch(r'\d+(\.\d+)?', v) for v in uniq):
        nums = sorted(uniq, key=float)
        return f'{nums[0]} to {nums[-1]}'
    return f'{uniq[0]} to {uniq[-1]}'

def summary_for(cols, rows, n):
    unit_cols = [i for i, c in enumerate(cols) if i > 0 and c not in ('Description', 'Contents', 'Set Size', 'Socket Type', 'Cut', 'Colour', 'Qty.', 'Head', 'Bit Length')]
    count = f"{n} {'model' if n == 1 else 'models'}"
    if 'Contents' in cols or 'Description' in cols and not unit_cols:
        return count
    for i in unit_cols:
        r = range_of([r[i] for r in rows])
        if r and len(r) < 38:
            label = re.sub(r'\s*\(.*?\)', '', cols[i]).replace('Specifications – ', '')
            unit = re.search(r'\((mm|gms|inch|CC|mm²)\)', cols[i])
            return f"{count} · {label} {r}{' ' + unit.group(1) if unit and not r.endswith(unit.group(1)) else ''}"
    return count

products = []
review = []
for s in S:
    sid = s['id']; cat = CAT_BY_NUM[num(sid)]
    name = names[sid]; slug = mkslug(name)
    cols = [COL_FIX.get(c, c) for c in s['columns']]
    rows = [[re.sub(r'\s+', ' ', c).strip() or '—' for c in r] for r in s['rows']]
    rows = [[('—' if c in ('-', '----', '–', '---', '-----') else c.replace('Fenale', 'Female')) for c in r] for r in rows]
    opt = s.get('options')
    specs, notes_txt, standard = [], [], None
    for nraw in s['notes']:
        if is_banner(nraw): continue
        t = clean_note(nraw)
        m = re.search(r'conforming to (.+)$', t, re.I)
        if m: standard = m.group(1).strip(); continue
        notes_txt.append(t[0].upper() + t[1:])
    if num(sid) == 54:
        specs.append({'label': 'Type', 'value': 'Non-sparking'})
    for t in notes_txt: specs.append({'label': 'Feature', 'value': t})
    if standard: specs.append({'label': 'Standard', 'value': f'Generally conforming to {standard}'})
    axis_opt = None
    if opt and len(opt['values']) == 1:
        specs.append({'label': 'Feature', 'value': opt['values'][0]}); opt = None
    if opt:
        axis_opt = opt['axis']
        specs.append({'label': 'Materials' if axis_opt == 'Material' else ('Finishes' if axis_opt == 'Finish' else axis_opt),
                      'value': ', '.join(opt['values'])})
    if s.get('design_no'): specs.append({'label': 'Design No.', 'value': s['design_no']})
    if s.get('hsn'): specs.append({'label': 'HSN code', 'value': s['hsn']})
    for r in s.get('remarks') or []:
        if re.search(r'price|₹|rs\.?\s|discount|extra|charge|gst|%', r, re.I): continue
        specs.append({'label': 'Note', 'value': r})
    # variants
    axes = cols + ([axis_opt] if axis_opt else [])
    vrows = []
    for i, r in enumerate(rows):
        if opt:
            for j, val in enumerate(opt['values']):
                if opt['available'][i][j]: vrows.append(r + [val])
        else:
            vrows.append(r)
    n_models = len(rows)
    summary = summary_for(cols, rows, n_models)
    if opt: summary += f" · {' / '.join(short(v) for v in opt['values'])}"
    # description (facts only)
    lead = name.split(' — ')[0] if ' — ' in name else re.sub(r'\s*\(.*?\)\s*$', '', name)
    desc = f"{lead} from Taparia"
    extras = [t.rstrip('.') for t in notes_txt if len(t) < 90]
    if extras: desc += ' — ' + '; '.join(x[0].lower() + x[1:] if not re.match(r'^[A-Z]{2,}', x) else x for x in extras)
    desc += '.'
    if standard: desc += f' Generally conforming to {standard}.'
    desc += f" {n_models} {'model is' if n_models == 1 else 'models are'} listed"
    if opt: desc += f", each available in {' and '.join(v[0].lower() + v[1:] if not v.startswith('Beryllium') and not v.startswith('Aluminium') else v for v in opt['values'])} where marked"
    desc += ', with Taparia product numbers for easy ordering.'
    img = f'assets/products/{cat}/tap-{slug[8:]}.webp'
    ok = extract(s, os.path.join(ROOT, 'public', img))
    if s.get('flags'): review.append((slug, s['flags']))
    products.append({
        'slug': slug, 'name': name, 'category': cat, 'subcategory': subcategory(s), 'brand': 'Taparia',
        'standard': ('IS ' + re.sub(r'^IS\s*', '', standard.split(',')[0]).strip()) if standard and standard.upper().startswith('IS') else (standard or None),
        'summary': summary, 'description': desc, 'images': [img] if ok else [], 'specifications': specs,
        'axes': axes, 'rows': vrows, 'optAxis': axis_opt, 'source': {'doc': 'TAPARIA', 'page': s['page'], 'section': f"{sid} {s['heading']}"},
    })

# ---------------------------------------------------------------- write TS
def js(v): return json.dumps(v, ensure_ascii=False)
out = ["import { Product } from '../../models/product.model';",
       "import { tapariaVariants as tv } from '../variant-builders';", "",
       "/**",
       " * Taparia Tools Ltd. — Price List April 2026 (44 pp). Every table transcribed (sections 1–55),",
       " * checked against the page images. Prices, pack sizes and price-related notes intentionally omitted.",
       " * Generated by scripts/taparia/gen_taparia.py — edit the generator (or this file by hand) with care.",
       " */",
       "const B = 'Taparia';", "",
       "export const TAPARIA_PRODUCTS: Product[] = ["]
for p in products:
    std = f"\n    standard: {js(p['standard'])}," if p['standard'] else ''
    out.append(f"""  {{
    slug: {js(p['slug'])},
    name: {js(p['name'])},
    category: {js(p['category'])},
    subcategory: {js(p['subcategory'])},
    brand: B,{std}
    summary: {js(p['summary'])},
    description: {js(p['description'])},
    images: {js(p['images'])},
    specifications: {js(p['specifications'])},
    variantAxes: {js(p['axes'])},
    variants: tv({js(p['axes'])}, {js(p['rows'])}),
    source: {{ doc: 'TAPARIA', page: {p['source']['page']}, section: {js(p['source']['section'])} }},
  }},""")
out.append("];\n")
open(os.path.join(ROOT, 'src/app/data/products/taparia.ts'), 'w').write('\n'.join(out))
json.dump(review, open(os.path.join(os.path.dirname(SRC), 'review.json'), 'w'), indent=1, ensure_ascii=False)
c = Counter(p['category'] for p in products)
print('products', len(products), 'variants', sum(len(p['rows']) for p in products), 'with image', sum(1 for p in products if p['images']))
print(dict(c))
