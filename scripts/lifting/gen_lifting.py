"""
Generate src/app/data/products/lifting.ts and the product photos for the lifting & material handling range.

Source: the lifting & material handling brochure supplied on 1 Oct 2026 (35 pp, no text layer). Every table was read
from 450-dpi crops and transcribed into transcription.json (one entry per heading, tables normalised to one row per
model). The client asked that the brochure's maker / brand name is NEVER shown on the site, so:
  * products carry brand '' (the UI hides empty brands) and source doc 'LIFTING' (no catalogue name is shown),
  * brand-derived series names are reduced to their letter ("T Series", "B Series"),
  * transcription.json has already had the maker's name removed.
Product photos may keep a maker's name that is physically printed / embossed on the product itself (client OK'd this).

Usage:  python3 scripts/lifting/gen_lifting.py <dir with extracted PDF images pNN_KK.png>
Prices: the brochure has none; nothing price-like is carried.
"""
import json, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
IMG_SRC = sys.argv[1] if len(sys.argv) > 1 else None
P = json.load(open(os.path.join(HERE, 'transcription.json')))

HOIST, SLING, RIG, CLAMP, MH = 'hoists-pulley-blocks', 'slings-lashing', 'lifting-chain-rigging', 'lifting-clamps-magnets', 'material-handling'

# index in transcription.json → (slug, display name, category, type, [photos])
# photo: 'pNN_KK' (cut out), 'pNN_KK:photo' (keep the scene), 'pNN_KK:bar' (also key out the brochure's blue bars),
#        optional crop suffix '@x0,y0,x1,y1'
CFG = {
    1: ('heavy-duty-chain-pulley-block-t-series', 'Heavy Duty Chain Pulley Block (T Series)', HOIST, 'Chain Pulley Blocks', ['p04_11:bar#0.4']),
    2: ('chain-pulley-block-revolve-series', 'Chain Pulley Block (Revolve Series, 360° Hand Chain Guide)', HOIST, 'Chain Pulley Blocks', ['p05_03', 'p05_04:photo']),
    3: ('chain-pulley-block-b-series', 'Chain Pulley Block (B Series)', HOIST, 'Chain Pulley Blocks', ['p05_02:bar#0.5']),
    4: ('ratchet-lever-hoist', 'Ratchet Lever Hoist', HOIST, 'Lever Hoists', ['p06_00:bar']),
    5: ('gear-trolley', 'Gear Trolley', HOIST, 'Trolleys', ['p06_02:photo']),
    6: ('pulling-lifting-machine-heavy-duty', 'Pulling & Lifting Machine (Heavy Duty)', HOIST, 'Pulling Machines & Cable Pullers', ['p07_00', 'p07_05']),
    8: ('electric-chain-hoist-single-speed', 'Electric Chain Hoist — Single Speed', HOIST, 'Electric Chain Hoists', ['p08_03:bar!0,395,85,652#0.45~214']),
    9: ('electric-chain-hoist-dual-speed', 'Electric Chain Hoist — Dual Speed (Inverter)', HOIST, 'Electric Chain Hoists', ['p08_08']),
    10: ('electric-trolley', 'Electric Trolley', HOIST, 'Trolleys', ['p09_02']),
    11: ('polyester-duplex-webbing-sling', 'Polyester Duplex Webbing Sling', SLING, 'Webbing & Round Slings', ['p09_15']),
    12: ('polyester-round-sling', 'Polyester Round Sling', SLING, 'Webbing & Round Slings', ['p10_10']),
    14: ('anti-abrasive-sling-sleeve', 'Anti-Abrasive Sling Sleeve', SLING, 'Sling Protection', ['p10_12', 'p10_13']),
    15: ('anti-cutting-sling-sleeve', 'Anti-Cutting Sling Sleeve', SLING, 'Sling Protection', ['p10_16']),
    16: ('sling-edge-protector', 'Sling Edge Protector', SLING, 'Sling Protection', ['p10_14']),
    17: ('cargo-lashing-ratchet', 'Cargo Lashing Ratchet', SLING, 'Lashing & Load Binders', ['p11_01:bar']),
    18: ('g80-alloy-steel-lifting-chain', 'G80 Alloy Steel Lifting Chain', RIG, 'Alloy Lifting Chain', ['p11_03@0,0,201,560']),
    19: ('screw-pin-dee-shackle', 'Screw Pin Dee Shackle', RIG, 'Shackles', ['p12_04']),
    20: ('nut-bolt-dee-shackle', 'Nut Bolt Dee Shackle', RIG, 'Shackles', ['p12_01']),
    21: ('screw-pin-bow-shackle', 'Screw Pin Bow Shackle', RIG, 'Shackles', ['p13_04']),
    22: ('nut-bolt-bow-shackle', 'Nut Bolt Bow Shackle', RIG, 'Shackles', ['p13_01']),
    23: ('g100-shortening-hook-assembly-master-link-2-leg', 'G100 Integrated Shortening Hook Assembly with Master Link — 2-Leg', RIG, 'G100 Fittings', ['p14_03']),
    24: ('g100-shortening-hook-assembly-master-link-4-leg', 'G100 Integrated Shortening Hook Assembly with Master Link — 4-Leg', RIG, 'G100 Fittings', ['p14_02']),
    25: ('g100-webbing-sling-hook-100-wk', 'G100 Webbing Sling Hook (100 WK)', RIG, 'G100 Fittings', ['p14_06']),
    26: ('g100-clevis-sling-hook-with-latch', 'G100 Clevis Sling Hook with Latch', RIG, 'G100 Fittings', ['p14_09']),
    27: ('g80-eye-sling-hook', 'G80 Eye Sling Hook', RIG, 'G80 Hooks', ['p15_01']),
    28: ('g80-clevis-sling-hook', 'G80 Clevis Sling Hook', RIG, 'G80 Hooks', ['p15_04']),
    29: ('g80-eye-self-locking-hook', 'G80 Eye Self Locking Hook', RIG, 'G80 Hooks', ['p16_01']),
    30: ('g80-clevis-self-locking-hook', 'G80 Clevis Self Locking Hook', RIG, 'G80 Hooks', ['p16_04']),
    31: ('g80-swivel-self-locking-hook', 'G80 Swivel Self Locking Hook', RIG, 'G80 Hooks', ['p17_01']),
    32: ('g80-swivel-eye-hook', 'G80 Swivel Eye Hook', RIG, 'G80 Hooks', ['p17_04']),
    33: ('g80-eye-grab-hook', 'G80 Eye Grab Hook', RIG, 'G80 Hooks', ['p18_01']),
    34: ('g80-clevis-shortening-grab-hook', 'G80 Clevis Shortening Grab Hook', RIG, 'G80 Hooks', ['p18_04']),
    35: ('g80-foundry-hook', 'G80 Foundry Hook', RIG, 'G80 Hooks', ['p19_00']),
    49: ('g80-container-lifting-hook', 'G80 Container Lifting Hook', RIG, 'G80 Hooks', ['p24_00', 'p24_01']),
    36: ('g80-master-link', 'G80 Master Link', RIG, 'Master Links', ['p19_02']),
    37: ('g80-master-link-assembly', 'G80 Master Link Assembly', RIG, 'Master Links', ['p20_00']),
    38: ('g80-master-link-assembly-enlarged-sublinks', 'G80 Master Link Assembly with Enlarged Sub-links', RIG, 'Master Links', ['p20_02']),
    39: ('g80-chain-connecting-link', 'G80 Chain Connecting Link', RIG, 'Connecting Links & Swivels', ['p21_01']),
    40: ('g80-webbing-connecting-link', 'G80 Webbing Connecting Link', RIG, 'Connecting Links & Swivels', ['p21_00']),
    41: ('g80-chain-shortener', 'G80 Chain Shortener', RIG, 'Connecting Links & Swivels', ['p21_03']),
    42: ('regular-swivel', 'Regular Swivel', RIG, 'Connecting Links & Swivels', ['p21_04']),
    43: ('weld-on-ring', 'Weld On Ring', RIG, 'Weld-on Fittings', ['p22_08']),
    44: ('g80-weld-on-hook', 'G80 Weld On Hook', RIG, 'Weld-on Fittings', ['p22_09']),
    45: ('galvanised-heavy-duty-wire-rope-clamp', 'Galvanised Heavy Duty Wire Rope Clamp', RIG, 'Wire Rope Clamps', ['p22_00', 'p22_05']),
    46: ('eye-bolt-din-580-galvanised', 'Eye Bolt DIN 580 (Galvanised)', RIG, 'Eye Bolts', ['p23_03']),
    47: ('g80-rotating-lifting-eye-bolt', 'G80 Rotating Lifting Eye Bolt', RIG, 'Eye Bolts', ['p23_00']),
    48: ('drop-forged-galvanised-turnbuckle-jaw-and-jaw', 'Drop Forged Galvanised Turnbuckle (Jaw & Jaw)', RIG, 'Turnbuckles', ['p24_08']),
    50: ('wire-rope-edge-protector-with-magnet', 'Wire Rope Edge Protector with Magnet', SLING, 'Sling Protection', ['p24_04']),
    51: ('drum-lifter', 'Drum Lifter', CLAMP, 'Drum Lifters', ['p25_00']),
    52: ('cable-puller', 'Cable Puller', HOIST, 'Pulling Machines & Cable Pullers', ['p25_01']),
    53: ('permanent-magnet-lifter', 'Permanent Magnet Lifter', CLAMP, 'Lifting Magnets', ['p25_05:photo']),
    54: ('industrial-skates', 'Industrial Skates', MH, 'Industrial Skates', ['p25_06:bar']),
    55: ('spring-balancer', 'Spring Balancer', HOIST, 'Spring Balancers', ['p26_01']),
    56: ('ratchet-load-binder', 'Ratchet Load Binder', SLING, 'Lashing & Load Binders', ['p26_02']),
    57: ('wire-rope-pulley-block-single-sheave', 'Wire Rope Pulley Block — Single Sheave (Closed, Heavy Duty)', HOIST, 'Pulley Blocks', []),
    58: ('wire-rope-pulley-block-double-sheave', 'Wire Rope Pulley Block — Double Sheave (Heavy Duty)', HOIST, 'Pulley Blocks', ['p27_02']),
    59: ('manila-rope-pulley', 'Manila Rope Pulley', HOIST, 'Pulley Blocks', ['p27_04']),
    60: ('horizontal-plate-lifting-clamp-pdb-type', 'Horizontal Plate Lifting Clamp (PDB Type)', CLAMP, 'Plate Clamps', ['p28_00']),
    61: ('lateral-plate-clamp', 'Lateral Plate Clamp', CLAMP, 'Plate Clamps', ['p28_01']),
    62: ('vertical-plate-lifting-clamp', 'Vertical Plate Lifting Clamp', CLAMP, 'Plate Clamps', ['p28_05']),
    63: ('universal-plate-lifting-clamp', 'Universal Plate Lifting Clamp', CLAMP, 'Plate Clamps', ['p28_07']),
    64: ('pipe-lifting-clamp-tph-type', 'Pipe Lifting Clamp (TPH Type)', CLAMP, 'Pipe & Beam Clamps', ['p29_00']),
    65: ('beam-clamp', 'Beam Clamp', CLAMP, 'Pipe & Beam Clamps', ['p29_01']),
    66: ('scissor-lift-pallet-truck', 'Scissor Lift Pallet Truck', MH, 'Pallet Trucks', ['p29_05']),
    67: ('hand-pallet-truck', 'Hand Pallet Truck', MH, 'Pallet Trucks', ['p30_47']),
    68: ('rough-terrain-truck', 'Rough Terrain Truck', MH, 'Pallet Trucks', ['p31_00']),
    69: ('hydraulic-lifting-table', 'Hydraulic Lifting Table', MH, 'Lifting Tables', ['p31_02']),
    70: ('drum-trolley', 'Drum Trolley', MH, 'Drum Handling', ['p31_03']),
    71: ('drum-lifter-cum-tilter', 'Drum Lifter cum Tilter', MH, 'Drum Handling', ['p32_00']),
    72: ('hand-stacker', 'Hand Stacker', MH, 'Stackers', ['p32_02']),
    73: ('electric-stacker', 'Electric Stacker', MH, 'Stackers', ['p33_00']),
    74: ('wire-mesh-container', 'Wire Mesh Container', MH, 'Storage Containers', ['p33_08', 'p33_09']),
}
FEATURED = {'heavy-duty-chain-pulley-block-t-series', 'g80-eye-self-locking-hook', 'hand-pallet-truck', 'vertical-plate-lifting-clamp'}

# ---------------------------------------------------------------- merges of feature-only headings
def feats(i): return list(P[i].get('features') or [])
def calls(i): return [c for c in (P[i].get('callouts') or []) if 'corner badge' not in c]

EXTRA_FEATURES = {
    1: calls(0),  # the T-series feature page (printed p. 1) belongs to the table on p. 2
}

def hoist_feature(c):
    """'Shell : It is made of light aluminum alloy shell, light but hard. The cooling…' → 'Shell: made of light aluminum alloy shell, light but hard'."""
    if ':' not in c: return c
    title, rest = [x.strip() for x in c.split(':', 1)]
    first = re.split(r'(?<=[a-z])\.\s*', rest)[0]
    first = re.sub(r'^(It is|It|This device is|The chain shall adopt the)\s+', '', first)
    return f'{title}: {first[:1].lower() + first[1:]}'

HOIST_FEATURES = [hoist_feature(c) for c in calls(7)]  # printed p. 8 (features of the electric chain hoists, specs on pp. 9–10)
EXTRA_FEATURES[8] = HOIST_FEATURES
EXTRA_FEATURES[9] = HOIST_FEATURES
DESC_LEAD = {
    8: 'aluminium alloy shell, G80 heat-treated alloy steel load chain, IP 55 protection and upper & lower limit switches',
    9: 'variable / dual speed with inverter; aluminium alloy shell, G80 heat-treated alloy steel load chain, IP 55 protection and upper & lower limit switches',
    55: '',
}
FEATURE_OVERRIDE = {
    1: feats(0) + feats(1),
    2: ['Hand chain hoist designed for heavy industrial applications'] + feats(2)[1:],
}
SAFE_USE = '; '.join(x.rstrip('.') for x in calls(13))  # printed instructions for webbing & round slings

# ---------------------------------------------------------------- text clean-up
TYPO = [(r'\bcontinuos\b', 'continuous'), (r'\bRang\b', 'Range'), (r'\bpining\b', 'pinion'), (r'\bBreak\b(?= *$)', 'Brake'),
        (r'Abbrassive', 'Abrasive'), (r'throughly', 'thoroughly'), (r'ratch sys', 'ratchet sys'), (r'\bas pre\b', 'as per'),
        (r'Quadriple', 'Quadruple'), (r'Radious', 'Radius'), (r'contractor', 'contactor'), (r'Tandam', 'tandem'),
        (r'Minium', 'Minimum'), (r'\bReted\b', 'Rated'), (r'Ovearall', 'Overall'), (r'\bTrave\b', 'Travel'),
        (r'Tendless', 'Endless'), (r'susceptible to cutting', 'resistant to cutting'), (r'precsion', 'precision'),
        (r'4 time swl', '4 times SWL'), (r'Curtic', 'Curtis'), (r'\bpully\b', 'pulling'), (r'CONATINER', 'CONTAINER'),
        (r'\bEn ?(\d)', r'EN \1'), (r'\bEN(\d)', r'EN \1'), (r'Shaft \(Dia & Length$', 'Shaft (Dia × Length)'),
        (r'\b360 rotating', '360° rotating'), (r"customer' needs", "customer's needs"), (r'steel-Quenched', 'steel, quenched'),
        (r'steel-quenched', 'steel, quenched'), (r'Off\.Thus', 'off. Thus'), (r'G 80\b', 'G80'), (r'Excessing', 'excessive'), (r'\s+', ' ')]
KEEP_UP = {'G80', 'G100', 'EN', 'DIN', 'IS', 'ISI', 'CE', 'IP', 'SWL', 'WLL', 'BS', 'ASME', 'RR-C-271F', 'IVA', 'AC', 'DC', 'PDB', 'TPH', 'I-BEAM'}

def fix(t):
    for a, b in TYPO: t = re.sub(a, b, t)
    return t.strip()

PROPER = {'German', 'Japanese', 'European', 'Federal', 'Specification', 'Type', 'Grade', 'Class', 'Indian', 'Curtis'}

def sentence(t):
    """Brochure bullets mix Title Case and random capitals; normalise to sentence case, keeping codes and names."""
    t = fix(t).rstrip('.').strip()
    out = []
    words = t.split()
    for k, w in enumerate(words):
        core = re.sub(r'[^\w\-]', '', w)
        if k and re.search(r'[.!?:)]$', words[k - 1]) and core[:1].isupper():
            out.append(w); continue
        if (core.upper() in KEEP_UP or re.search(r'\d', core) or core in PROPER
                or (core.isupper() and len(core) <= 4 and k > 0) or not core[:1].isupper()):
            out.append(w)
        elif k == 0:
            out.append(w[:1].upper() + w[1:].lower())
        else:
            out.append(w.lower())
    t = ' '.join(out)
    return t[:1].upper() + t[1:]

def lead_lower(t):
    w = t.split()[0] if t else ''
    core = re.sub(r'[^\w\-]', '', w)
    return t if (core in PROPER or core.upper() in KEEP_UP or re.match(r'^[A-Z0-9]{2,}', t)) else t[:1].lower() + t[1:]

def clean_col(c):
    c = fix(c)
    # master link assembly: the 1st group of A/B/D is the master link, the 2nd the sub-link (drawing labels a/b/d)
    m = re.match(r'^([ABD]) \((I\.LENGTH|I\.WIDTH|I\.W|DIA)\) \[(1st|2nd) group\]$', c)
    if m:
        what = {'I.LENGTH': 'inner length', 'I.WIDTH': 'inner width', 'I.W': 'inner width', 'DIA': 'dia'}[m.group(2)]
        c = f"Master link {m.group(1)} ({what})" if m.group(3) == '1st' else f"Sub-link {m.group(1).lower()} ({what})"
    c = re.sub(r'^A \(I\.LENGTH\)$', 'Master link A (inner length)', c)
    c = re.sub(r'^B \(I\.WIDTH\)$', 'Master link B (inner width)', c)
    c = re.sub(r'^D \(DIA\)$', 'Master link D (dia)', c)
    c = re.sub(r'^a \(I\.L\)$', 'Sub-link a (inner length)', c)
    c = re.sub(r'^b \(I\.W\)$', 'Sub-link b (inner width)', c)
    c = re.sub(r'^d \(Dia\)$', 'Sub-link d (dia)', c)
    c = c.replace('(1st column)', '(first)').replace('(2nd column)', '(second)')
    c = re.sub(r'\(\s*KG\s*\)|\(KG\)|\( KG \)', '(kg)', c, flags=re.I)
    c = re.sub(r'\((MM|Mm)\)', '(mm)', c).replace('(Kgs)', '(kg)').replace('(KGS)', '(kg)').replace('(Kg)', '(kg)')
    c = c.replace('W.L.L.', 'W.L.L').replace('Dimension H (2nd)', 'Dimension h').replace('Dimension D (2nd)', 'Dimension d')
    return c

def clean_val(v):
    v = re.sub(r'\s+', ' ', str(v)).strip()
    if v in ('', '-', '–', '--'): return '—'
    v = v.replace('AC22oV', 'AC220V')
    v = re.sub(r'^±(\d)', r'Ø\1', v)
    v = v.replace('”', '"')
    v = re.sub(r'^(\d+(?:\.\d+)?)\s*(?:TON|Ton|ton)S?$', r'\1 t', v)
    return v

# ---------------------------------------------------------------- tables → variants
CAP_RE = re.compile(r'capacity|w\.?l\.?l|^ton$|rated|load capacity|working load', re.I)
SIZE_RE = re.compile(r'^size|chain size|wire rope dia|min-max chain|webbing width', re.I)

def cap_text(h, v):
    if v == '—': return None
    if re.search(r'[a-zA-Z]', v): return v
    hl = h.lower()
    if re.search(r'\((t|ton|tons|tonnes)\)|^ton$|in tonnes', hl): return f'{v} t'
    if '(kg' in hl: return f'{v} kg'
    if '(lbs)' in hl: return f'{v} lbs'
    if 'w.l.l' in hl or 'working load' in hl: return f'WLL {v}'
    if '(mm)' in hl: return f'{v} mm'
    return f'Cap. {v}'

def size_text(h, v):
    if v == '—': return None
    hl = h.lower()
    if '(in)' in hl: return f'{v}"' if not v.endswith('"') else v
    if '(mm)' in hl or 'mm' in hl: return f'{v} mm' if re.fullmatch(r'[\d.\-x×]+', v) else v
    if re.fullmatch(r'[\d.]+', v): return f'Size {v}'
    return v

def short_col(c): return re.sub(r' *\(.*?\)', '', c)

def row_label(cols, r):
    has_code = cols[0].lower().startswith('item code')
    bits = [r[0]] if has_code else []
    ci = next((i for i, c in enumerate(cols) if i and CAP_RE.search(c)), None) if has_code else 0
    si = next((i for i, c in enumerate(cols) if i and SIZE_RE.search(c)), None)
    if ci is not None and (t := cap_text(cols[ci], r[ci])): bits.append(t)
    if si is not None and si != ci and (t := size_text(cols[si], r[si])) and len(t) <= 16: bits.append(t)
    if not has_code:
        if not bits: bits.append(size_text(cols[0], r[0]) or r[0])
        if 'Color' in cols: bits.append(r[cols.index('Color')])
        bits = bits[:1] + [b for b in bits[1:] if b == r[cols.index('Color')]] if 'Color' in cols else bits[:1]
    if len(bits) == 1 and has_code and len(cols) > 1: bits.append(f'{r[1]}')
    return ' · '.join(dict.fromkeys(b for b in bits if b))

def num(v):
    m = re.match(r'^\s*(\d+(?:\.\d+)?)', v)
    return float(m.group(1)) if m else None

def summary_for(cols, rows):
    n = len(rows)
    count = f"{n} {'model' if n == 1 else 'models'}"
    coded = cols[0].lower().startswith('item code')
    ci = next((i for i, c in enumerate(cols) if i and CAP_RE.search(c)), None) if coded else 0
    by_size = ci is None
    if by_size: ci = next((i for i, c in enumerate(cols) if i and SIZE_RE.search(c)), None)
    if ci is not None:
        vals = [r[ci] for r in rows if r[ci] != '—']
        if vals and all(re.fullmatch(r'\d+(\.\d+)? t', v) for v in vals):
            nums = [float(v[:-2]) for v in vals]
            lo, hi = vals[nums.index(min(nums))], vals[nums.index(max(nums))]
            return f"{count} · {lo[:-2]} to {hi}" if lo != hi else f"{count} · {hi}"
        if vals and all(re.fullmatch(r'\d+(\.\d+)?( t)?', v) for v in vals) and any(v.endswith(' t') for v in vals):
            vals = [v[:-2] if v.endswith(' t') else v for v in vals]
            nums = [float(v) for v in vals]
            return f"{count} · {vals[nums.index(min(nums))]} to {vals[nums.index(max(nums))]} t"
        nums = [num(v) for v in vals]
        if vals and all(x is not None for x in nums) and len(set(nums)) > 1 and not re.search(r'[a-z]', ''.join(vals), re.I):
            lo, hi = vals[nums.index(min(nums))], vals[nums.index(max(nums))]
            t = (size_text(cols[ci], hi) if by_size else cap_text(cols[ci], hi)) or hi
            unit = t[len(hi):].strip() if t.startswith(hi) else ''
            pre = t[:-len(hi)].strip() if t.endswith(hi) else ''
            return f"{count} · {(pre + ' ') if pre else ''}{lo} to {hi}{(' ' + unit) if unit else ''}"
        if vals:
            return f"{count} · {cap_text(cols[ci], vals[0]) or vals[0]}"
    return count

# ---------------------------------------------------------------- images
BAR = np.array([0, 132, 180], float)

def cut(im, bar=False, holes=None, white=236):
    rgb = np.asarray(im.convert('RGB')).astype(float)
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    bgc = (mn > white) & (mx - mn < 22)
    if bar: bgc |= np.abs(rgb - BAR).max(axis=2) < 46
    lab, n = ndi.label(bgc)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    if bar:  # the brochure's blue bars also show through gaps (e.g. between chain falls): drop them everywhere
        bg |= ndi.binary_dilation(np.abs(rgb - BAR).max(axis=2) < 46, iterations=1)
    if holes is not None:  # white gaps enclosed by chain falls below the hoist body (y > holes × height)
        lab2, n2 = ndi.label(bgc & ~bg)
        for k, sl in enumerate(ndi.find_objects(lab2), start=1):
            if sl and (sl[0].start + sl[0].stop) / 2 > holes * bgc.shape[0] and (lab2[sl] == k).sum() > 40:
                bg |= lab2 == k
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    lab, n = ndi.label(fg)
    if not n: return None
    sizes = ndi.sum(fg, lab, range(1, n + 1))
    fg = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v > 0.05 * sizes.max()])
    fg = ndi.binary_erosion(fg, iterations=1)
    alpha = (ndi.gaussian_filter(fg.astype(float), 0.7) * 255).clip(0, 255).astype('uint8')
    out = im.convert('RGBA'); out.putalpha(Image.fromarray(alpha))
    return out

def make_image(spec, dest):
    spec, _, white = spec.partition('~')
    spec, _, holes = spec.partition('#')
    spec, _, blank = spec.partition('!')
    name, _, crop = spec.partition('@')
    file, _, mode = name.partition(':')
    im = Image.open(os.path.join(IMG_SRC, file + '.png')).convert('RGBA')
    if im.getchannel('A').getextrema()[0] < 250:  # had a soft mask: flatten on white first
        bgw = Image.new('RGBA', im.size, (255, 255, 255, 255)); bgw.alpha_composite(im); im = bgw
    if blank:  # white out a piece of brochure layout that overlaps the photo (e.g. table cells)
        im.paste((255, 255, 255, 255), tuple(int(v) for v in blank.split(',')))
    if crop: im = im.crop(tuple(int(v) for v in crop.split(',')))
    if mode == 'photo':
        out = im.convert('RGB')
        out.thumbnail((900, 900), Image.LANCZOS)
        out.save(dest, 'WEBP', quality=84, method=6)
        return True
    out = cut(im, bar=(mode == 'bar'), holes=float(holes) if holes else None, white=int(white) if white else 236)
    if out is None: return False
    bb = out.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    out = out.crop(bb)
    pad = max(12, int(max(out.size) * 0.04))
    canvas = Image.new('RGBA', (out.width + 2 * pad, out.height + 2 * pad), (0, 0, 0, 0)); canvas.paste(out, (pad, pad), out)
    canvas.thumbnail((900, 900), Image.LANCZOS)
    canvas.save(dest, 'WEBP', quality=84, method=6)
    return True

# ---------------------------------------------------------------- products
RENAME_COLS = {53: {'Capacity (T)': 'Capacity'}}
DROP_COLS = {12: ['Unlabelled column 1', 'Unlabelled column 2', 'Unlabelled column 3'], 63: ['NG (Catal)', 'Actual']}
products, review = [], []
for i, (slug, name, cat, sub, photos) in sorted(CFG.items(), key=lambda kv: list(CFG).index(kv[0])):
    s = P[i]
    t = s.get('table') or {'columns': [], 'rows': []}
    cols0 = t['columns']; keep = [k for k, c in enumerate(cols0) if c not in DROP_COLS.get(i, [])]
    cols = [RENAME_COLS.get(i, {}).get(cols0[k], clean_col(cols0[k])) for k in keep]
    rows = [[clean_val(r[k]) for k in keep] for r in t['rows']]
    dup = [c for c, n in Counter(cols).items() if n > 1]
    assert not dup, (slug, dup)
    rows = [r for r in rows if any(v != '—' for v in r[1:])] if len(rows) > 1 else rows  # all-blank printed rows
    fl = FEATURE_OVERRIDE.get(i, feats(i)) + EXTRA_FEATURES.get(i, []) + ([] if i in (1, 7, 55) else calls(i) if not feats(i) else [])
    fl = list(dict.fromkeys(sentence(f) for f in fl if f and len(f) > 3 and not f.endswith(':') and 'certificate' not in f.lower()))
    std_compact = re.sub(r'\s', '', (s.get('standard') or '')).lower()
    fl = [f for f in fl if re.sub(r'\s', '', f).lower() != std_compact]
    specs = []
    std = s.get('standard')
    if std:
        std = fix(std).replace(';', ',')
        specs.append({'label': 'Standard', 'value': std})
    cert = s.get('certification')
    if cert:
        c = re.sub(r'\s*\(.*?\)', '', cert).strip()
        c = {'CE CERTIFIED': 'CE certified', 'Approved by ISI': 'ISI approved', 'CE Certificate': 'CE certified'}.get(c, sentence(c))
        specs.append({'label': 'Certification', 'value': c})
    single = len(rows) == 1
    if single:
        for c, v in zip(cols, rows[0]):
            if v != '—': specs.append({'label': c, 'value': v})
    for f in fl[:12]: specs.append({'label': 'Feature', 'value': f})
    if i in (11, 12) and SAFE_USE: specs.append({'label': 'Safe use', 'value': sentence(SAFE_USE)})
    if i == 55: specs.append({'label': 'Parts shown', 'value': '; '.join(sentence(c) for c in calls(55) if 'certificate' not in c.lower())})
    extra = s.get('extra_tables') or []
    for e in extra:  # e.g. size table of the electric hoists, EN 1677 WLL table — shown as spec lines
        ec = [clean_col(c) for c in e['columns']]
        for r in e['rows']:
            r = [clean_val(v) for v in r]
            specs.append({'label': f"{fix(e.get('title') or 'Table').title()} — {ec[0]} {r[0]}",
                          'value': ' · '.join(f'{a}: {b}' for a, b in zip(ec[1:], r[1:]) if b != '—')})
    labels = [row_label(cols, r) for r in rows] if rows else []
    dupl = {l for l, n in Counter(labels).items() if n > 1}
    for k, r in enumerate(rows):
        if labels[k] in dupl:
            extra = next((short_col(cols[j]) + ' ' + r[j] for j in range(1, len(cols))
                          if r[j] != '—' and len({rows[m][j] for m in range(len(rows)) if labels[m] == labels[k]}) > 1), None)
            if extra: labels[k] += f' · {extra}'
    summary = summary_for(cols, rows) if rows else 'Sizes on request'
    lead = DESC_LEAD.get(i, fl[0] if fl else '')
    desc = name.replace(' — ', ', ')
    desc = f"{desc}{' — ' + lead_lower(lead) if lead else ''}."
    if i not in DESC_LEAD and len(fl) > 1 and len(desc) < 160: desc += f' {fl[1]}.'
    coded = bool(cols) and cols[0].lower().startswith('item code')
    if rows: desc += (f" {len(rows)} models are listed" + (', each with its item code' if coded else '') + '.') if len(rows) > 1 else (' Listed with its item code.' if coded else '')
    if std: desc += f' Standard: {std}.'
    imgs = []
    if IMG_SRC:
        os.makedirs(os.path.join(ROOT, 'public', 'assets', 'products', cat), exist_ok=True)
        for k, ph in enumerate(photos):
            rel = f"assets/products/{cat}/{slug}{'' if k == 0 else '-' + str(k + 1)}.webp"
            if make_image(ph, os.path.join(ROOT, 'public', rel)): imgs.append(rel)
    else:
        imgs = [f"assets/products/{cat}/{slug}{'' if k == 0 else '-' + str(k + 1)}.webp" for k in range(len(photos))]
    flags = [fix(f) for f in (s.get('flags') or []) if not re.search(r'(?i)brand|logo|\[maker\]|series line|header', f)]
    if flags: review.append({'slug': slug, 'page': s['printed_page'], 'flags': flags})
    products.append(dict(slug=slug, name=name, category=cat, subcategory=sub, summary=summary, description=desc,
                         standard=(std.split(',')[0].strip() if std and len(std) < 40 else None), images=imgs,
                         specifications=specs, axes=cols if rows else [], rows=rows, labels=labels,
                         page=s['printed_page'], section=fix(s['name']).title(), featured=slug in FEATURED,
                         review=('; '.join(flags)[:600] if flags else None)))

# ---------------------------------------------------------------- write TS
def js(v): return json.dumps(v, ensure_ascii=False)
out = ["import { Product } from '../../models/product.model';",
       "import { labelled } from '../variant-builders';", "",
       "/**",
       " * Lifting & material handling range — from the brochure supplied on 1 Oct 2026 (35 pp, read visually).",
       " * The client asked that the brochure's maker / brand name is never shown, so brand is '' and the source",
       " * catalogue is not named on the site. Item codes are the brochure's own. No prices (none were printed).",
       " * Generated by scripts/lifting/gen_lifting.py — edit the generator (or this file by hand) with care.",
       " */",
       "export const LIFTING_PRODUCTS: Product[] = ["]
for p in products:
    std = f"\n    standard: {js(p['standard'])}," if p['standard'] else ''
    feat = "\n    featured: true," if p['featured'] else ''
    rv = f"\n    reviewNote: {js(p['review'])}," if p['review'] else ''
    variants = f"labelled({js(p['axes'])}, {js(p['rows'])}, {js(p['labels'])})" if p['rows'] else '[]'
    out.append(f"""  {{
    slug: {js(p['slug'])},
    name: {js(p['name'])},
    category: {js(p['category'])},
    subcategory: {js(p['subcategory'])},
    brand: '',{std}
    summary: {js(p['summary'])},
    description: {js(p['description'])},
    images: {js(p['images'])},
    specifications: {js(p['specifications'])},
    variantAxes: {js(p['axes'])},
    variants: {variants},
    source: {{ doc: 'LIFTING', page: {p['page']}, section: {js(p['section'])} }},{feat}{rv}
  }},""")
out.append("];\n")
open(os.path.join(ROOT, 'src/app/data/products/lifting.ts'), 'w').write('\n'.join(out))
json.dump(review, open(os.path.join(HERE, 'review.json'), 'w'), indent=1, ensure_ascii=False)
print('products', len(products), 'variants', sum(len(p['rows']) for p in products),
      'with image', sum(1 for p in products if p['images']), dict(Counter(p['category'] for p in products)))
