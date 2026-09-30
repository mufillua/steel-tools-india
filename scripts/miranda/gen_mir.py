import json, re
P = json.load(open('mir_pages.json'))
def L(p): return [l.rstrip() for l in P[str(p)] if l.strip()]
def dedupe(xs):
    out=[]; [out.append(x) for x in xs if x not in out]; return out
num = lambda s: float(s)

# ---------- size extractors ----------
INT_INCH={19,20,21,22,26,27,28,32,33,34,35,41,42,47,48,51,52}
def dia_rows(p, a=0, b=None):
    """Drill / reamer style: leading mm value, or leading inch fraction.
    On pages where mm sizes are always printed with decimals, a bare integer is an inch size."""
    out=[]
    for l in L(p)[a:b]:
        mint=re.match(r'^\s*(\d)\s+[\d,*-]', l)
        if p in INT_INCH and mint:
            out.append(f'{mint.group(1)}"'); continue
        m=re.match(r'^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?/\d+|\d+/\d+)?', l)
        mi=re.match(r'^\s*(\d+(?:\.\d+)?/\d+|\d+/\d+)\s*"?\s', l)
        if mi and '/' in mi.group(1):
            out.append(f'{mi.group(1)}"')
        elif m and '/' not in m.group(1):
            v=m.group(1); frac=m.group(2)
            try:
                if not (0.1 <= float(v) <= 120): continue
            except: continue
            out.append(f'{float(v):g} mm' + (f' ({frac}")' if frac and '/' in frac else ''))
    return out
def xrows(p, a=0, b=None, dims=2):
    """'3 x 75' / '1/8 x 1/2 x 6' style (inch or mm), with optional mm equivalent."""
    out=[]
    pat = r'\s*[xX×]\s*'.join([r'([\d./]+)']*dims)
    for l in L(p)[a:b]:
        m=re.match(r'^\s*'+pat+r'(?:\s+'+r'\s*[xX]\s*'.join([r'([\d.]+)']*dims)+')?', l)
        if not m: continue
        g=m.groups(); first=g[:dims]; mm=g[dims:]
        if any('/' in x for x in first) or (mm and mm[0]):
            s=' × '.join(f'{x}"' for x in first)
            if mm and mm[0]: s += ' (' + ' × '.join(mm) + ' mm)'
        else:
            s=' × '.join(first) + ' mm'
        out.append(s)
    return out
def tap_rows(p, a=0, b=None):
    out=[]
    for l in L(p)[a:b]:
        s=l.strip()
        m=(re.match(r'^(M\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)', s) or None)
        if m: out.append(f'{m.group(1)} × {float(m.group(2)):g}'); continue
        m=re.match(r'^(No\.?\s*\d+|NO\.?\s*\d+)\s*[xX]\s*(\d+)', s, re.I)
        if m:
            n=re.sub(r'\D','',m.group(1)); out.append('No.'+n+' × '+m.group(2)); continue
        m=re.match(r'^([\d.]+/\d+|\d+)\s*(?:"|inch)?\s*[xX]\s*(\d+(?:\.\d+)?)', s)
        if m: out.append(f'{m.group(1)}" × {m.group(2)}')
    return out
def sc_rows(p, a=0, b=None, cols=('Ø','Shank Ø','Flute L','OAL')):
    out=[]
    for l in L(p)[a:b]:
        m=re.match(r'^\s*(\d+\.\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s', l)
        if m:
            d,sh,fl,oal=[f'{float(x):g}' for x in m.groups()]
            out.append(f'Ø{d} × {oal} OAL · flute {fl} · shank Ø{sh}')
    return out

products=[]
def add(slug,name,cat,sub,summary,desc,specs,page,section,sizes=None,axis='Size',standard=None,note=None,featured=False):
    sizes=dedupe(sizes or [])
    products.append(dict(slug=slug,name=name,cat=cat,sub=sub,summary=summary,desc=desc,specs=specs,page=page,section=section,sizes=sizes,axis=axis,standard=standard,note=note,featured=featured))

HSS='hss-cutting-tools'; CTT='carbide-tipped-tools-burrs'; SC='solid-carbide-tools'
GR_TB=[('Grades','ZEDD (M2), S100 (M35), S200 (M42), S400 (T42), S400E (M35, cryogenic), S500 (T42, cryogenic)'),
       ('ZEDD','HSS with 0% cobalt (62–65 HRc)'),('S100','M35 — HSS with 5% cobalt (63–66 HRc)'),('S200','M42 — HSS with 8% cobalt (65–68 HRc)'),
       ('S400','T42 — HSS with 10% cobalt (64–67 HRc)'),('S400E','M35 with cryogenic (ultra low) heat treatment (64–67 HRc)'),('S500','T42 with cryogenic (ultra low) heat treatment (65–69 HRc)')]
GRADE_NOTE='Please confirm which grade is available in the size you need.'
# ---- Toolbits ----
add('hss-square-toolbit-blank-inch','HSS Square Toolbit Blank (Inch)',HSS,'HSS Toolbit Blanks','3/32" to 1" square · 6 grades',
    'Square HSS toolbit blanks in inch sizes with bevelled ends, listed in six grades from ZEDD (M2) to S500 (T42, cryogenic treated). '+GRADE_NOTE,
    GR_TB+[('Ends','Bevelled')],7,'HSS Square Toolbit Blanks (Inch)',xrows(7,dims=2),featured=True)
add('hss-square-toolbit-blank-mm','HSS Square Toolbit Blank (mm)',HSS,'HSS Toolbit Blanks','3 × 75 mm to 25 × 200 mm · 6 grades',
    'Square HSS toolbit blanks in metric sizes, listed in six grades from ZEDD (M2) to S500 (T42, cryogenic treated). '+GRADE_NOTE,
    GR_TB,8,'HSS Square Toolbit Blanks (mm)',xrows(8,dims=2))
add('hss-round-toolbit-blank-inch','HSS Round Toolbit Blank (Inch)',HSS,'HSS Toolbit Blanks','Inch sizes · 6 grades',
    'Round HSS toolbit blanks in inch sizes, listed in six grades from ZEDD (M2) to S500 (T42, cryogenic treated). '+GRADE_NOTE,
    GR_TB,9,'HSS Round Toolbit Blanks (Inch)',xrows(9,dims=2))
add('hss-round-toolbit-blank-mm','HSS Round Toolbit Blank (mm)',HSS,'HSS Toolbit Blanks','Metric sizes · 6 grades',
    'Round HSS toolbit blanks in metric sizes, listed in six grades from ZEDD (M2) to S500 (T42, cryogenic treated). '+GRADE_NOTE,
    GR_TB,10,'HSS Round Toolbit Blanks (mm)',xrows(10,dims=2))
FL_GR=[('Grades','Mark III (M35), T42'),('Mark III','M35 — HSS with 5% cobalt (63–66 HRc)'),('T42','HSS with 10% cobalt (64–67 HRc)')]
add('hss-flat-toolbit-blank-inch','HSS Flat (Rectangular) Toolbit Blank (Inch)',HSS,'HSS Toolbit Blanks','Thickness × width × length, inch',
    'Flat (rectangular) HSS toolbit blanks in inch sizes, listed in Mark III and T42 grades. '+GRADE_NOTE,
    FL_GR,12,'HSS Flat (Rectangular) Toolbit Blanks (Inch)',xrows(12,dims=3))
add('hss-parting-toolbit','HSS Parting Toolbit',HSS,'HSS Toolbit Blanks','3/32" × 1/2" × 4" to 3/16" × 1" × 6"',
    'HSS parting toolbits in inch sizes, listed in Mark II, T42 and S500 grades. '+GRADE_NOTE,
    [('Grades','Mark II, T42, S500'),('Mark II','M2 — HSS with 0% cobalt (62–65 HRc)'),('T42','HSS with 10% cobalt'),('S500','T42 with cryogenic (ultra low) heat treatment (65–69 HRc)')],
    13,'HSS Parting Toolbits',xrows(13,0,12,dims=3))
add('hss-flat-toolbit-blank-mm','HSS Flat (Rectangular) Toolbit Blank (mm)',HSS,'HSS Toolbit Blanks','Metric thickness × width × length',
    'Flat (rectangular) HSS toolbit blanks in metric sizes, listed in Mark III and T42 grades. '+GRADE_NOTE,
    FL_GR,13,'HSS Flat (Rectangular) Toolbit Blanks (mm)',xrows(13,13,None,dims=3))
zp=[]
for l in L(14):
    m=re.match(r'TOOLBIT BLANK SQ ([\d/.]+)"X([\d/.]+)"',l)
    if m: zp.append(f'{m.group(1)}" × {m.group(2)}" square')
add('hss-toolbit-blank-zedd-p','HSS Toolbit Blank — Zedd P',HSS,'HSS Toolbit Blanks','Square 3/16" to 1"',
    'Square HSS toolbit blanks in the Zedd P grade, listed from 3/16" × 4" to 1" × 8".',[('Grade','ZEDD P')],14,'HSS Toolbit Blank Zedd P',zp)
# ---- Drills ----
DRILL_TYPES=[('Types','Std. jobber drills (M2), Gold jobber drills (M2), Super jobber drills (M35)')]
add('hss-parallel-shank-jobber-drill','HSS Parallel Shank Jobber Drill',HSS,'HSS Drills','Ø0.8 mm upward · IS 5101 / DIN 338',
    'HSS parallel shank jobber series drills to IS 5101 / DIN 338, in standard (M2), Gold (M2) and Super (M35) versions, listed in metric sizes with inch and gauge equivalents.',
    DRILL_TYPES+[('Standards','IS 5101 / DIN 338')],19,'HSS Parallel Shank Jobber Series (IS 5101 / DIN 338)',dia_rows(19)+dia_rows(20)+dia_rows(21),standard='IS 5101 / DIN 338',featured=True)
add('hss-parallel-shank-stub-drill','HSS Parallel Shank Stub Drill',HSS,'HSS Drills','Standard & Gold stub drills',
    'HSS parallel shank stub series drills in standard and Gold versions, listed in metric and inch sizes.',
    [('Types','Std. stub drills, Gold stub drills')],22,'HSS Parallel Shank Stub Series',dia_rows(22))
add('hss-intermediate-length-drill','HSS Intermediate Length Drill, Type N, 130°',HSS,'HSS Drills','Bright finish · 130° point',
    'HSS intermediate length drill, type N, 130° point angle, bright finish.',[('Type','N'),('Point angle','130°'),('Finish','Bright')],23,
    'HSS Intermediate Length Drill, Type N, 130° PA - Bright Finish',[])
add('hss-jobber-drill-steam-tempered','HSS Jobber Drill — Steam Tempered',HSS,'HSS Drills','Steam tempered finish',
    'HSS jobber drills with steam tempered finish.',[('Finish','Steam tempered')],23,'HSS Jobber Drill - Steam Tempered',[])
add('hss-jobber-drill-set','HSS Jobber Drill Set',HSS,'HSS Drills','Metric & inch sets · 13 to 51 pieces',
    'HSS jobber drill sets to IS 5101 in metric and inch ranges, in Regular, Gold, Super and TiN coated versions (as listed per set).',
    [('Standard','IS 5101 - 1991'),('Versions','Regular, Gold, Super, TiN coated')],24,'HSS Jobber Drill Set',
    ['1.50 to 6.50 mm (13 pcs)','1.00 to 10.00 mm (19 pcs)','1.00 to 13.00 mm (25 pcs)','1.00 – 6.00 mm (51 pcs)','6.0 – 10.0 × 0.1 mm','1/16" to 1/4" (13 pcs)','1/16" to 3/8" (21 pcs)','1/16" to 1/2" (29 pcs)'],axis='Set',standard='IS 5101')
add('hss-jobber-drill-tin-coated','HSS Jobber Drill — TiN Coated',HSS,'HSS Drills','TiN coated',
    'TiN coated HSS jobber drills, parallel shank jobber series, type N 118° (IS 5101 / DIN 338).',[('Coating','TiN'),('Type','N, 118°'),('Standards','IS 5101 / DIN 338')],25,'HSS Jobber Drills TiN Coated',[],standard='IS 5101 / DIN 338')
add('hss-e-jobber-drill-tin-coated','HSS-E Jobber Drill — TiN Coated, DIN 338',HSS,'HSS Drills','HSS-E · TiN coated',
    'TiN coated HSS-E jobber drills to DIN 338.',[('Material','HSS-E'),('Coating','TiN'),('Standard','DIN 338')],25,'HSS-E Jobber Drills TiN Coated, DIN 338',[],standard='DIN 338')
add('hss-parallel-shank-long-series-drill','HSS Parallel Shank Drill — Long Series, DIN 340',HSS,'HSS Drills','Long series · DIN 340',
    'HSS parallel shank long series drills to DIN 340, listed in metric and inch sizes. (The price list notes a minimum order value for this series.)',
    [('Standard','DIN 340')],26,'HSS Parallel Shank-Long Series, DIN 340',dia_rows(26),standard='DIN 340')
add('hss-parallel-shank-extra-long-drill','HSS Parallel Shank Drill — Extra Long Series, BS 328',HSS,'HSS Drills','Extra long · flute lengths 100–350 mm',
    'HSS parallel shank extra long series drills to BS 328, listed by diameter with flute lengths of 100, 120, 150, 200, 250 and 350 mm (OAL 160–400 mm).',
    [('Standard','BS 328'),('Flute lengths','100, 120, 150, 200, 250, 350 mm'),('Overall lengths','160, 175, 200, 250, 315, 400 mm')],27,'HSS Parallel Shank-Extra Long Series, BS 328',dia_rows(27),standard='BS 328')
add('hss-e-extra-length-drill','HSS-E Extra Length Drill, Type N 118°, BS 328',HSS,'HSS Drills','HSS-E · bright finish',
    'HSS-E extra length drills, type N 118°, bright finish, to BS 328, listed by diameter with overall lengths from 100 to 400 mm.',
    [('Material','HSS-E'),('Type','N, 118°'),('Finish','Bright'),('Standard','BS 328')],28,'HSS-E Extra Length Drill, Type N 118° - Bright Finish, BS 328',dia_rows(28),standard='BS 328')
add('hss-centre-drill','HSS / HSS-E Centre Drill',HSS,'HSS Drills','Type A, R, B (DIN 333) · BS type',
    'HSS centre drills in Type A, Type R and Type B to DIN 333 (pilot Ø0.80–8.00 mm), and HSS-E centre drills, bright finish, BS type BS-1 to BS-7 (BS 328).',
    [('Types','A, R, B (DIN 333); BS (BS 328)'),('Pilot Ø (DIN 333)','0.80–8.00 mm')],30,'HSS Center Drills / HSS-E Centre Drill, Bright Finish, BS 328',
    [f'Type A / R · pilot Ø{p}' for p in ['0.80','1.00','1.25','1.60','2.00','2.50','3.15','4.00','5.00','6.30','8.00']]+
    [f'Type B · pilot Ø{p}' for p in ['1.00','1.25','1.60','2.00','2.50','3.15','4.00','5.00','6.30','8.00']]+[f'BS-{i}' for i in range(1,8)])
add('hss-taper-shank-drill','HSS & HSS-E Taper Shank Drill',HSS,'HSS Drills','IS 5103 / DIN 345',
    'HSS and HSS-E taper shank drills to IS 5103 - 1969 / DIN 345, in Regular and Super versions, listed in metric and inch sizes.',
    [('Standards','IS 5103 - 1969, DIN 345'),('Versions','Regular, Super')],32,'HSS & HSS-E Taper Shank Drills',dia_rows(32)+dia_rows(33)+dia_rows(34),standard='IS 5103 / DIN 345',featured=True)
add('hss-taper-shank-drill-long-series','HSS Taper Shank Drill — Long Series',HSS,'HSS Drills','IS 8305 (Type N) / DIN 341',
    'HSS taper shank drills, long series, to IS 8305 - 1976 (type N) / DIN 341, listed by size with overall length.',
    [('Standards','IS 8305 - 1976 (Type N), DIN 341')],35,'HSS Taper Shank Drills - Long Series',dia_rows(35),standard='IS 8305 / DIN 341')
add('hss-taper-shank-drill-extra-long','HSS Taper Shank Twist Drill — Extra Long Series',HSS,'HSS Drills','OAL 200–500 mm',
    'HSS taper shank twist drills, extra long series, listed by diameter with overall lengths from 200 to 500 mm.',
    [('Overall lengths','200, 235, 250, 300, 315, 325, 350, 370, 400, 450, 500 mm')],36,'HSS Taper Shank Twist Drills (Extra Long Series)',dia_rows(36)+dia_rows(37))
add('masonry-drill','Masonry Drill (Ground Fluted & Bright Plated)',HSS,'HSS Drills','3 mm to 13 mm · metric & inch',
    'Masonry drills, ground fluted and bright plated, listed by size with flute length and overall length.',
    [('Finish','Ground fluted & bright plated')],39,'Masonary Drills',dia_rows(39))
# ---- Endmills & reamers ----
add('hss-endmill-centre-cut','HSS Parallel Shank Endmill — Centre Cut (M2 & M42)',HSS,'HSS Endmills','4 & 6 flute · IS 6353 / BS 122',
    'HSS centre cut parallel shank endmills in M2 and M42, 4 flute and 6 flute, to IS 6353 - 1991 & BS 122 (Part 1) 1953.',
    [('Materials','M2, M42'),('Flutes','4, 6'),('Standards','IS 6353 - 1991, BS 122 (Part 1) 1953')],41,'HSS (M2 & M42) Parallel Shank Endmills — Center Cut',dia_rows(41),standard='IS 6353 / BS 122',featured=True)
add('hss-endmill-non-centre-cut','HSS Parallel Shank Endmill — Non-Centre Cut (M2 & M42)',HSS,'HSS Endmills','4 & 6 flute · IS 6353 / BS 122',
    'HSS non-centre cut parallel shank endmills in M2 and M42, 4 flute and 6 flute, to IS 6353 - 1991 & BS 122 (Part 1) 1953.',
    [('Materials','M2, M42'),('Flutes','4, 6'),('Standards','IS 6353 - 1991, BS 122 (Part 1) 1953')],42,'HSS (M2 & M42) Parallel Shank Endmills — Non-Center Cut',dia_rows(42),standard='IS 6353 / BS 122')
add('hss-slot-drill','HSS Parallel Shank Slot Drill (M2 & M42)',HSS,'HSS Endmills','IS 6352 / BS 122',
    'HSS parallel shank slot drills in M2 and M42, to IS 6352 - 1991 & BS 122 (Part 1) 1953.',
    [('Materials','M2, M42'),('Standards','IS 6352 - 1991, BS 122 (Part 1) 1953')],43,'HSS (M2 & M42) Parallel Shank Slot Drills',dia_rows(43),standard='IS 6352 / BS 122')
add('hss-endmill-long-series','HSS Parallel Shank Endmill — Long Series (M2 & M42)',HSS,'HSS Endmills','IS 6353',
    'HSS parallel shank endmills, long series, in M2 and M42, to IS 6353 - 1991.',[('Materials','M2, M42'),('Standard','IS 6353 - 1991')],44,'HSS (M2 & M42) Parallel Shank Endmills - Long Series',[],standard='IS 6353')
add('hss-roughing-endmill-m42','HSS Parallel Shank Roughing Endmill — M42',HSS,'HSS Endmills','4 flutes · coarse & fine',
    'HSS parallel shank roughing endmills in M42, 4 flutes, standard series with coarse and fine pitch, to IS 6353 - 1991.',[('Material','M42'),('Flutes','4'),('Pitch','Coarse, fine'),('Standard','IS 6353 - 1991')],44,'HSS Parallel Shank Roughing Endmills - M42',[],standard='IS 6353')
add('hss-ball-nose-endmill','HSS Parallel Shank Ball Nose Endmill',HSS,'HSS Endmills','IS 6353',
    'HSS parallel shank ball nose endmills to IS 6353 - 1991.',[('Standard','IS 6353 - 1991')],44,'HSS Parallel Shank Ball Nose Endmill',[],standard='IS 6353')
m42=[]
for l in L(45)[:28]:
    m=re.match(r'ENDMILL ([\d.]+)X([\d.]+)X([\d.]+)X([\d.]+)X(\d)F PLSHK CC M42 TIALN',l)
    if m: m42.append(f'Ø{m.group(1)} × {m.group(4)} OAL · flute {m.group(3)} · shank Ø{m.group(2)} · {m.group(5)}F')
add('m42-tialn-coated-centre-cut-endmill','M42 TiAlN Coated Centre Cut Endmill',HSS,'HSS Endmills','M42 · TiAlN · 4 flute',
    'Centre cut parallel shank endmills in M42 with TiAlN coating, listed from Ø5 to Ø12 mm.',[('Material','M42'),('Coating','TiAlN'),('Type','Centre cut, parallel shank')],45,'M42 TiAlN Coated Center Cut Endmills',m42,
    note='Size rows read from the text extract; the section heading sits below the rows in the source text.')
add('hss-reamer-h7','HSS Reamer — H7 Tolerance',HSS,'HSS Reamers','Hand, M42 hand & taper shank machine reamers',
    'HSS reamers with H7 tolerance to BS 328, IS 5444 and IS 5445: HSS hand reamers, HSS M42 hand reamers and taper shank machine reamers, listed in metric and inch sizes.',
    [('Tolerance','H7'),('Types','HSS hand reamer, HSS M42 hand reamer, taper shank machine reamer'),('Standards','BS 328, IS 5444, IS 5445')],47,'HSS Reamers with H7 Tolerance',dia_rows(47)+dia_rows(48),standard='BS 328 / IS 5444 / IS 5445')
tpr=[]
for l in L(49):
    m=re.match(r'^\s*(\d{1,2})\s+([\d,*]+)\s*$',l)
    if m: tpr.append(f'{m.group(1)} mm')
add('hss-taper-pin-hand-reamer','HSS Taper Pin Hand Reamer (Taper 1 in 50)',HSS,'HSS Reamers','Ø5 to Ø50 mm · IS 5881',
    'HSS taper pin hand reamers, taper 1 in 50, to IS 5881, listed by diameter from 5 mm to 50 mm.',[('Taper','1 in 50'),('Standard','IS 5881')],49,'HSS Taper Pin Hand Reamers (Taper 1 in 50)',tpr,standard='IS 5881')
add('hss-taper-shank-core-drill','HSS Taper Shank Core Drill',HSS,'Core Drills & Annular Cutters','M2 & M35 · IS 5366 / DIN 343',
    'High speed steel taper shank core drills in M2 and M35, to IS 5366 - 1978, ISO 7079 - 1981, DIN 343 - 1981 and BS 328 - 1959, listed in metric and inch sizes.',
    [('Materials','M2, M35'),('Standards','IS 5366 - 1978, ISO 7079 - 1981, DIN 343 - 1981, BS 328 - 1959')],51,'High Speed Steel Taper Shank Core Drills',dia_rows(51)+dia_rows(52,0,32)+dia_rows(52,41,67),standard='DIN 343')
ann=[f'Ø{float(x):g} mm' for x in [re.match(r'^\s*(\d+(?:\.\d+)?)\s',l).group(1) for l in L(54) if re.match(r'^\s*\d+(?:\.\d+)?\s+[*\d]',l)]]
add('hss-annular-cutter','HSS Annular Cutter',HSS,'Core Drills & Annular Cutters','Ø12 upward · 35 & 50 mm depth',
    'HSS annular cutters in M2 (35 mm and 50 mm cutting length) and M42 (50 mm cutting length), listed by diameter from 12 mm.',
    [('Materials','HSS M2, HSS M42'),('Cutting lengths','35 mm, 50 mm (M2); 50 mm (M42)')],54,'HSS Annular Cutter',ann)
TCTRX=re.compile(r'^\s*(\d+\.\d+)\s+[*\d]')
tct=['Ø%g mm' % float(TCTRX.match(l).group(1)) for l in L(55) if TCTRX.match(l)]
add('tct-annular-cutter','TCT Annular Cutter',HSS,'Core Drills & Annular Cutters','Ø12 upward · 35 to 100 mm depth',
    'Tungsten carbide tipped (TCT) annular cutters listed by diameter from 12 mm, in 35, 50, 75 and 100 mm cutting lengths. Ejector pins are also listed.',
    [('Cutting lengths','35, 50, 75, 100 mm')],55,'TCT Annular Cutter',tct)
# ---- Taps ----
T='HSS Taps'
add('hss-hand-tap-metric-coarse','HSS Straight Flute Hand Tap — Metric Coarse',HSS,T,'M2 to M52 · IS 6175',
    'HSS ground thread hand taps, straight flute, metric coarse pitch, to IS 6175 Part 1, 2 & 3 - 1992: taper, second and bottom taps, sets, serial sets and TiN coated versions.',
    [('Flute','Straight'),('Thread','Metric coarse'),('Standard','IS 6175 Part 1, 2 & 3 - 1992'),('Types','Taper, second, bottom, set (SO3), serial set, TiN coated')],57,'HSS Straight Flute Taps (Metric Coarse)',tap_rows(57)+tap_rows(58,0,31),standard='IS 6175',featured=True)
add('hss-tap-retapping-6g-metric-coarse','HSS Tap — Retapping & 6G, Metric Coarse',HSS,T,'Retapping, 4H, 6G',
    'HSS straight flute taps for retapping and in 4H and 6G tolerance classes, metric coarse.',[('Tolerance classes','4H, 6G'),('Thread','Metric coarse')],58,'HSS Taps (Retapping & 6G) Metric Coarse',tap_rows(58,32))
add('hss-spiral-point-spiral-flute-tap-metric-coarse','HSS Spiral Point & Spiral Flute Tap — Metric Coarse',HSS,T,'SPPT & spiral flute · plain, TiN, 6G',
    'HSS spiral point (SPPT) and spiral flute taps, metric coarse, in plain, TiN coated, 6G and retapping versions.',[('Types','Spiral point, spiral flute'),('Versions','Plain, TiN, 6G, retapping')],59,'HSS Taps SPPT, Spiral Flute (Metric Coarse)',tap_rows(59))
add('m35-m42-hss-tap-metric-coarse','M35 & M42 HSS Tap — Metric Coarse',HSS,T,'M35 / M42 · taper, plug, bottom, SPPT, spiral',
    'M35 and M42 HSS taps, metric coarse: taper, plug and bottom taps, sets, TiN coated, spiral point and spiral flute versions.',[('Materials','M35, M42'),('Thread','Metric coarse')],60,'M35 and M42 HSS Taps (Metric Coarse)',tap_rows(60,0,38))
add('hss-long-shank-machine-tap','HSS Long Shank Machine Tap',HSS,T,'Straight flute & Type B spiral flute',
    'HSS long shank machine taps, metric coarse, in straight flute (taper, bottom, bottom TiN, bottoming 6G) and Type B spiral flute M35 versions.',[('Types','Straight flute, Type B spiral flute (M35)')],60,'HSS Long Shank Machine Taps',tap_rows(60,38))
add('left-hand-tap-metric-coarse','Left Hand Tap — Metric Coarse',HSS,T,'Left hand · metric coarse',
    'Left hand HSS taps, metric coarse.',[('Hand','Left'),('Thread','Metric coarse')],61,'Left Hand Taps (Metric Coarse)',tap_rows(61,0,26))
add('hss-straight-flute-tap-metric-fine','HSS Straight Flute Tap — Metric Fine',HSS,T,'Metric fine · SO2 sets, M35, M42',
    'HSS straight flute taps, metric fine pitch: taper, second and bottom taps, SO2 / SO3 sets, M35 and M42 versions, and spiral flute.',[('Thread','Metric fine'),('Versions','Taper, second, bottom, SO2, SO3, M35, M42, spiral flute')],61,'HSS Straight Flute Taps (Metric Fine)',
    tap_rows(61,26)+tap_rows(62)+tap_rows(63)+tap_rows(64,0,25))
add('left-hand-tap-metric-fine','Left Hand HSS Straight Flute Tap — Metric Fine',HSS,T,'Left hand · metric fine',
    'Left hand HSS straight flute taps, metric fine pitch.',[('Hand','Left'),('Thread','Metric fine')],64,'Left Hand HSS Straight Flute Taps (Metric Fine)',tap_rows(64,25))
add('hss-machine-tap-metric-fine','HSS Machine Tap — Metric Fine',HSS,T,'M8 × 1 to M36 × 3',
    'HSS machine taps, metric fine pitch, straight flute and spiral point.',[('Thread','Metric fine')],65,'HSS Machine Taps (Metric Fine)',tap_rows(65,0,17))
add('hss-tap-bsw','HSS Tap — BSW',HSS,T,'1/16" to 3"',
    'HSS taps for BSW threads: taper, plug, bottom, sets, serial sets, spiral point and spiral flute.',[('Thread','BSW'),('Standard','BS 949')],65,'HSS Taps - BSW',tap_rows(65,17),standard='BS 949')
add('hss-tap-bsf','HSS Tap — BSF',HSS,T,'3/16" to 2.3/4"',
    'HSS taps for BSF threads, in sets (SO3) and bottom taps.',[('Thread','BSF')],66,'HSS Taps (BSF)',tap_rows(66,0,31))
add('hss-tap-ba','HSS Tap — BA',HSS,T,'0 BA to 10 BA',
    'HSS taps for BA threads, in sets (SO3).',[('Thread','BA')],66,'HSS Taps (BA)',[f'{m.group(1)} BA' for m in [re.match(r'^\s*(\d+) x [\d.]+\s',l) for l in L(66)[31:]] if m])
add('hss-tap-unc','HSS Tap — UNC',HSS,T,'No.2 to 3"',
    'HSS taps for UNC threads: sets (SO3), taper, plug, bottom, TiN coated and spiral flute.',[('Thread','UNC')],67,'HSS Taps (UNC)',tap_rows(67))
add('hss-tap-unf','HSS Tap — UNF',HSS,T,'No.0 to 1.5/8"',
    'HSS taps for UNF threads: sets (SO3), taper, plug and bottom taps.',[('Thread','UNF')],68,'HSS Taps (UNF)',tap_rows(68,0,26))
add('hss-pipe-tap','HSS Pipe Tap — BSP(P) G, BSPT Rp, BSPT Rc',HSS,T,'1/16" to 3.1/2"',
    'HSS pipe taps for BSP (parallel) G, BSPT Rp and BSPT Rc threads: taper, bottom and SO2 sets.',[('Threads','BSP(P) G, BSPT Rp, BSPT Rc'),('Standard','BS 949')],68,'HSS Pipe Taps',tap_rows(68,26),standard='BS 949')
add('hss-tap-npt','HSS Tap — NPT',HSS,T,'1/16" to 3.1/2"',
    'HSS taps for NPT threads: taper, bottom, SO2 sets, M35 and M35 TiN.',[('Thread','NPT')],69,'HSS Taps (NPT)',tap_rows(69,0,19))
add('hss-un-tap','HSS UN Tap',HSS,T,'1" to 2.1/2" · 8, 12, 14 TPI',
    'HSS taps for UN threads, in sets (SO3), bottom taps and SO2 sets.',[('Thread','UN')],69,'HSS UN Taps',tap_rows(69,25))
add('hss-e-nib-tap-alcrn','HSS-E (8% Co) Nib Tap with AlCrN Coating',HSS,T,'M6 × 1.0 · M8 × 1.25',
    'HSS-E (8% cobalt) nib taps with AlCrN coating to Miranda standard, listed in M6 × 1.00 and M8 × 1.25.',[('Material','HSS-E (8% Co)'),('Coating','AlCrN')],69,'HSS-E (8%Co) Nib Taps with AlCrN Coating to Miranda Standard',['M6 × 1','M8 × 1.25'])
add('hss-helicoil-tap-metric-coarse','HSS Helicoil Tap — Metric Coarse',HSS,T,'M3 to M24',
    'HSS helicoil taps, metric coarse: taper, plug, bottom and SO3 sets.',[('Thread','Metric coarse (helicoil)')],70,'HSS Helicoil Taps - Metric Coarse',tap_rows(70,0,16))
add('din-standard-tap','DIN Standard Tap (DIN 371 / DIN 376)',HSS,T,'M4 to M24 · SPPT M35',
    'DIN standard taps — DIN 371 (M4 to M10) and DIN 376 (M12 to M24) — bottom TiN and spiral point M35 versions.',[('Standards','DIN 371, DIN 376')],70,'DIN Standard Taps',tap_rows(70,16),standard='DIN 371 / DIN 376')
add('high-performance-tap-platinum-cut','High Performance Tap — Miranda Edge Platinum Cut',HSS,T,'SPPT, spiral flute, straight flute, cast iron',
    'Miranda Edge Platinum Cut high performance taps in spiral point, spiral flute, straight flute and cast iron versions, uncoated, TiN or TiAlN coated.',
    [('Types','Spiral point, spiral flute, straight flute, cast iron (bottom / second)'),('Coatings','Uncoated, TiN, TiAlN')],79,'High Performance Taps - Miranda Edge Platinum Cut',[])
# ---- Carbide tipped tools (auto) ----
ctt=[]; cur=None
HEAD=re.compile(r'^\s*(ISO \d+ ?\( ?\d+ ?\)|\d{3}(?: \( ?\d+°\))?(?: - CRANKED)?|IND-2)\s*$')
for p in range(81,89):
    X=L(p); i=0
    while i<len(X):
        l=X[i]
        if HEAD.match(l) and not re.match(r'^\s*\d{4}',l):
            code=re.sub(r'\s+',' ',HEAD.match(l).group(1).replace('( ','(').replace(' )',')')).strip()
            code=code.replace(' - CRANKED','')
            words=[]; j=i+1
            if 'CRANKED' in l: words.append('CRANKED')
            while j<len(X) and not X[j].startswith('SHANK'):
                words.append(X[j].strip()); j+=1
            cur=dict(code=code,name=' '.join(words).title().replace('.', '').strip(),page=p,sizes=[],rh_only=False)
            ctt.append(cur); i=j; continue
        if cur and 'RIGHT HAND (RH), PRICE' in l and 'LEFT HAND' not in l: cur['rh_only']=True
        if cur:
            m0=re.match(r'^\s*00(\d{2})\s+(\d+)\b',l)
            if m0: cur['sizes'].append(f'Ø{int(m0.group(1))} mm round · L {m0.group(2)}'); i+=1; continue
            m=re.match(r'^\s*(\d{2})(\d{2})\s+(\d+)\b',l)
            mi=re.match(r'^\s*(\d+/\d+"|1")\s+(\d+)\b',l)
            if m: cur['sizes'].append(f'{int(m.group(1))} × {int(m.group(2))} mm · L {m.group(3)}')
            elif mi: cur['sizes'].append(f'{mi.group(1)} · L {mi.group(2)}')
        if l.startswith('PRODUCT DESCRIPTION'): cur=None
        i+=1
for c in ctt:
    nm=c['name'].replace('Tools ','Tools ').replace('( ','(')
    nm=re.sub(r'\s+',' ',nm)
    code=c['code']
    slug='ctt-'+re.sub(r'[^a-z0-9]+','-',(code+' '+nm).lower()).strip('-')
    hands='Right hand' if c['rh_only'] else 'Right hand (RH) and left hand (LH)'
    add(slug,f'Carbide Tipped {nm} — {code}',CTT,'Carbide Tipped Tools',f'{code} · shank {c["sizes"][0].split(" · ")[0]} upward' if c['sizes'] else code,
        f'Tungsten carbide tipped {nm.lower()} to {code}, listed by shank size (H × B) and length L, in {hands.lower()} versions with carbide grades P20, P30, P40, K05, K10 and K20.',
        [('Designation',code),('Hand',hands),('Carbide grades','P20, P30, P40, K05, K10, K20'),('Size','Shank H × B (mm), length L (mm)')],c['page'],f'{code} {nm}',c['sizes'],axis='Shank · length')
# ---- Rotary burrs ----
shapes={}; curshape=None
for p in (91,92):
    for l in L(p)[5:]:
        m=re.match(r'^([A-Z][A-Z ]+?)\s+(M?[A-Z]{1,2}M\d+)\s+(\d+MM X \d+MM X \d+MM X \d+SHK)',l)
        m2=re.match(r'^(M?[A-Z]{1,2}M\d+)\s+(\d+MM X \d+MM X \d+MM X \d+SHK)',l)
        if m: curshape=m.group(1).title(); shapes.setdefault(curshape,[]).append((m.group(2),m.group(3)))
        elif m2 and curshape: shapes[curshape].append((m2.group(1),m2.group(2)))
fmt=lambda d: re.sub(r'(\d+)MM X (\d+)MM X (\d+)MM X (\d+)SHK', r'head Ø\1 × \2 · OAL \3 · shank Ø\4', d)
for sh,items in shapes.items():
    add('tungsten-carbide-rotary-burr-'+re.sub(r'[^a-z0-9]+','-',sh.lower()).strip('-'),f'Tungsten Carbide Rotary Burr — {sh}',CTT,'Rotary Burrs',
        f'{len(items)} sizes · standard, double cut, TiN',
        f'Tungsten carbide rotary burrs, {sh.lower()} shape, listed by Miranda code with head diameter × head length, overall length and shank diameter, in standard cut, double cut and standard cut TiN coated versions (as listed per code).',
        [('Shape',sh),('Cuts','Standard cut, double cut, standard cut TiN coated'),('Size','Head Ø × head length, OAL, shank Ø (mm)')],91 if any(k in sh for k in ['Conical','Cylindrical','Flame','Cone']) else 92,
        'Tungsten Carbide Rotary Burrs',[f'{code} · {fmt(d)}' for code,d in items],axis='Code · size')
add('tungsten-carbide-rotary-burr-set','Tungsten Carbide Rotary Burr Set (5 pcs)',CTT,'Rotary Burrs','AM3, BM4, CM5, TM3, SM4',
    'Set of 5 tungsten carbide rotary burrs: AM3, BM4, CM5, TM3 and SM4.',[('Contents','AM3, BM4, CM5, TM3, SM4')],92,'Tungsten Carbide Rotary Burrs — Set of 5 Pieces',[])
# ---- Solid carbide ----
S='Miranda Solid Carbide'
EMS=[('Size','Cutting Ø × OAL, flute length (APMX), shank Ø (DCON)')]
def scdesc(p, idx): 
    X=L(p); return X[idx].strip() if idx < len(X) else ''
add('miranda-2-flute-solid-carbide-end-mill','2 Flute Solid Carbide End Mill',SC,'Square Endmills','Ø0.5 upward · 35° helix',
    '2-flute solid carbide square end mill with a variety of lengths, 35° helix and 10° rake, for milling standard slots.',EMS+[('Flutes','2'),('Helix','35°'),('Rake','10°')],96,'2 Flute Solid Carbide End Mill',[],note='Sizes for this and the 4-flute standard end mill share one page in the text extract and cannot be separated reliably.')
add('miranda-4-flute-solid-carbide-end-mill-standard','4 Flute Solid Carbide End Mill — Standard',SC,'Square Endmills','Standard length · AlTiN',
    '4-flute standard length solid carbide square end mill with 35° helix and 10° rake, designed for multi applications, AlTiN coated.',EMS+[('Flutes','4'),('Length','Standard'),('Helix','35°'),('Rake','10°'),('Coating','AlTiN')],96,'4 Flute Solid Carbide End Mill Standard',[])
add('miranda-4-flute-solid-carbide-end-mill-long','4 Flute Solid Carbide End Mill — Long',SC,'Square Endmills','Long length',
    '4-flute long length solid carbide square end mill.',EMS+[('Flutes','4'),('Length','Long')],97,'4 Flute Solid Carbide End Mill Long',sc_rows(97))
add('miranda-4-flute-solid-carbide-end-mill-extra-long','4 Flute Solid Carbide End Mill — Extra Long',SC,'Square Endmills','Extra long length',
    '4-flute extra long length solid carbide square end mill.',EMS+[('Flutes','4'),('Length','Extra long')],98,'4 Flute Solid Carbide End Mill Extra Long',[])
add('miranda-2-flute-solid-carbide-ball-nose-standard','2 Flute Solid Carbide Ball Nose End Mill — Standard',SC,'Ballnose Endmills','Standard length · 30° helix',
    '2-flute standard length solid carbide ball nose end mill with 30° helix.',EMS+[('Flutes','2'),('Length','Standard'),('Helix','30°')],98,'2 Flute Solid Carbide Ball Nose End Mill Standard',[])
add('miranda-4-flute-solid-carbide-ball-nose-standard','4 Flute Solid Carbide Ball Nose End Mill — Standard',SC,'Ballnose Endmills','Standard length',
    '4-flute standard length solid carbide ball nose end mill.',EMS+[('Flutes','4'),('Length','Standard')],99,'4 Flute Solid Carbide Ball Nose End Mill Standard',[])
add('miranda-4-flute-solid-carbide-ball-nose-long','4 Flute Solid Carbide Ball Nose End Mill — Long',SC,'Ballnose Endmills','Long length · 30° helix',
    '4-flute long length solid carbide ball nose end mill with 30° helix.',EMS+[('Flutes','4'),('Length','Long'),('Helix','30°')],99,'4 Flute Solid Carbide Ball Nose End Mill Long',[])
add('miranda-4-flute-solid-carbide-ball-nose-extra-long','4 Flute Solid Carbide Ball Nose End Mill — Extra Long',SC,'Ballnose Endmills','Extra long length · 30° helix',
    '4-flute extra long length solid carbide ball nose end mill with 30° helix.',EMS+[('Flutes','4'),('Length','Extra long'),('Helix','30°')],100,'4 Flute Solid Carbide Ball Nose End Mill Extra Long',sc_rows(100,0,33))
MAXX=[('Series','Maxx Pro'),('Work material','45 to 60 HRC (hardened steel, WMG H)'),('Coating','AlTiSiN'),('Helix','37°'),('Rake','Positive'),('Shank','Cylindrical'),('Dry milling','Suitable')]
add('maxx-pro-4-flute-sc-square-end-mill-standard','Maxx Pro 4 Flute SC Square End Mill — Standard Length (45–60 HRC)',SC,'Maxx Pro Endmills','Ø1 to Ø16 · AlTiSiN',
    'Premium Maxx Pro 4-flute solid carbide square end mill, standard length, with unequal helix and 6° rake for contouring applications in 45 to 60 HRC material.',MAXX+[('Flutes','4')],101,'4 Flute SC Sq. End Mill Maxx Pro - Standard Length (45 to 60 HRC)',sc_rows(101),featured=True)
add('maxx-pro-4-flute-sc-square-end-mill-long','Maxx Pro 4 Flute SC Square End Mill — Long Length (45–60 HRC)',SC,'Maxx Pro Endmills','Long length · AlTiSiN',
    'Premium Maxx Pro 4-flute solid carbide square end mill, long length, for 45 to 60 HRC material.',MAXX+[('Flutes','4')],102,'4 Flute SC Sq. End Mill Maxx Pro - Long Length (45 to 60 HRC)',[])
add('maxx-pro-2-flute-sc-ball-nose-standard','Maxx Pro 2 Flute SC Ball Nose — Standard Length (45–60 HRC)',SC,'Maxx Pro Endmills','Standard length · AlTiSiN',
    'Premium Maxx Pro 2-flute solid carbide ball nose end mill, standard length, for 45 to 60 HRC material.',MAXX+[('Flutes','2')],102,'2 Flute SC Ball Nose Maxx Pro - Standard Length (45 to 60 HRC)',[])
add('maxx-pro-4-flute-sc-ball-nose-standard','Maxx Pro 4 Flute SC Ball Nose — Standard Length (45–60 HRC)',SC,'Maxx Pro Endmills','Standard length · AlTiSiN',
    'Premium Maxx Pro 4-flute solid carbide ball nose end mill, standard length, for 45 to 60 HRC material.',MAXX+[('Flutes','4')],103,'4 Flute SC Ball Nose Maxx Pro - Standard Length (45 to 60 HRC)',[])
add('maxx-pro-4-flute-sc-ball-nose-long','Maxx Pro 4 Flute SC Ball Nose — Long Length (45–60 HRC)',SC,'Maxx Pro Endmills','Long length · AlTiSiN',
    'Premium Maxx Pro 4-flute solid carbide ball nose end mill, long length, with unequal helix and 6° rake, for 45 to 60 HRC material.',MAXX+[('Flutes','4')],103,'4 Flute SC Ball Nose Maxx Pro - Long Length (45 to 60 HRC)',[])
add('maxx-pro-4-flute-sc-ball-nose-extra-long','Maxx Pro 4 Flute SC Ball Nose — Extra Long Length (45–60 HRC)',SC,'Maxx Pro Endmills','Extra long · AlTiSiN',
    'Premium Maxx Pro 4-flute solid carbide ball nose end mill, extra long length, with unequal helix and 6° rake, for 45 to 60 HRC material.',MAXX+[('Flutes','4')],104,'4 Flute SC Ball Nose Maxx Pro - Extra Long Length (45 to 60 HRC)',sc_rows(104,0,36))
def drill_rows(p):
    out=[]
    for l in L(p):
        m=re.match(r'^\s*(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s',l)
        if m:
            dc,dcon,lcf,oal,ls=[f'{float(x):g}' for x in m.groups()]
            out.append(f'Ø{dc} × {oal} OAL · flute {lcf} · shank Ø{dcon}')
    return out
DR=[('Size','Cutting Ø (DC) × OAL, flute length (LCF), shank Ø (DCON MS), shank length (LS)')]
add('miranda-solid-carbide-jobber-drill','Solid Carbide Jobber Drill',SC,'Solid Carbide Drills','Ø1 to Ø20 mm',
    'Miranda solid carbide jobber drills, listed from Ø1.00 to Ø20.00 mm with flute length, overall length and shank dimensions.',DR,105,'Solid Carbide Jobber Drill',drill_rows(105)+drill_rows(106))
add('miranda-solid-carbide-stub-drill','Solid Carbide Stub Drill',SC,'Solid Carbide Drills','Ø1 to Ø20 mm',
    'Miranda solid carbide stub drills, listed from Ø1.00 to Ø20.00 mm with flute length, overall length and shank dimensions.',DR,107,'Solid Carbide Stub Drill',drill_rows(107)+drill_rows(108))
add('miranda-solid-carbide-centre-drill','Solid Carbide Centre Drill 60° Countersink, Bright',SC,'Solid Carbide Drills','60° · standard & BS type',
    'Solid carbide centre drills with 60° countersink, bright finish, in standard and BS types.',[('Countersink','60°'),('Finish','Bright'),('Types','Standard, BS type')],109,'Solid Carbide Centre Drill 60° Countersink, Bright / BS Type',[])
scr=[]
for l in L(110)[:12]:
    m=re.match(r'^\s*(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s',l)
    if m: scr.append(f'Ø{float(m.group(1)):g} H7')
add('miranda-solid-carbide-reamer-h7','Solid Carbide Reamer, H7 Accuracy, Bright Finish',SC,'Solid Carbide Reamers','H7 · Ø3 to Ø13',
    'Solid carbide reamers with H7 accuracy and bright finish.',[('Accuracy','H7'),('Finish','Bright')],110,'Solid Carbide Reamer, H7 Accuracy, Bright Finish',scr)

json.dump(products,open('mir/mir_products.json','w'),indent=1)
for p in products: print(f"{p['slug'][:60]:60} {len(p['sizes']):4}  {p['sizes'][:2]} ... {p['sizes'][-1:] }")
print(len(products))
