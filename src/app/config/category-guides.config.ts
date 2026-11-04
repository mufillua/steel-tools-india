/**
 * Buying guides for the category landing pages (/categories/<slug>): a "Choosing …" heading and three short
 * paragraphs shown below the product list, prerendered so Google reads them.
 *
 * Each guide works in the words buyers actually search for, taken from Google Search Console queries for this site
 * (e.g. "socket set", "complete socket set all sizes", "solid carbide drill supplier in india", "indexable milling",
 * "lnmu03 insert", "non sparking tools", "bt reducer", "g80 chain", "clamping kit supplier west bengal",
 * "pallet jack scissor lift") and the search volumes noted in seo-keywords.config.ts ("spring balancer",
 * "hand pallet truck", "d shackle", "chain pulley block", "allen key set", "pipe wrench", "taparia screwdriver set").
 *
 * Rules (checked by product.service.spec.ts):
 *   • facts come from the catalogue data and the standards printed in the supplier documents — no invented specs;
 *   • no prices, and the lifting brochure's maker name never appears (lifting guides name no brand at all);
 *   • [label](slug) links to a product page, [label](/path) to any page — every product slug must exist.
 * If a category's products change, check its guide still matches what is listed.
 */
export interface CategoryGuide {
  /** H2 of the guide section, worded the way buyers search. */
  title: string;
  /** Plain-text paragraphs; [label](slug) becomes a link (see guideSegments). */
  paragraphs: string[];
}

/** One run of guide text: plain text, or a link to a product (or other) page. */
export interface GuideSegment {
  text: string;
  link?: string;
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Splits a guide paragraph into text and link segments. A bare slug links to /products/<slug>. */
export function guideSegments(text: string): GuideSegment[] {
  const out: GuideSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at) });
    out.push({ text: m[1], link: m[2].startsWith('/') ? m[2] : `/products/${m[2]}` });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The guide as plain text (links reduced to their labels) — for checks and word counts. */
export function guidePlainText(guide: CategoryGuide): string {
  return [guide.title, ...guide.paragraphs].map((p) => p.replace(LINK, '$1')).join('\n');
}

export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  'machine-tool-accessories': {
    title: 'Choosing ER Collets, Collet Chucks & BT-40 Tool Holders',
    paragraphs: [
      'Start with the spindle taper. Most VMCs and machining centres in Indian workshops run [BT-40](bt-40-er-collet-chuck) or BT-50 holders; other machines take ISO-30/40/50, SK-40, CAT-40 or HSK-63A, and conventional milling machines often take Morse taper or R8. The holder must match the spindle exactly, and so must the [pull stud](pull-stud): BT pull studs to MAS 403 come in 45°, 30°, 60° and 90° versions, solid or through coolant, so check the one your machine uses.',
      'An ER collet chuck holds drills, end mills and reamers in [ER collets](er-collet) to DIN 6499. Pick the collet size to suit the chuck (ER-11 to ER-40 on BT-40, up to ER-50 on BT-50) and the collet bore to suit the tool shank; an [ER collet set](er-collet-set) covers every shank in steps. Use a [side lock holder](bt-40-side-lock-holder) for Weldon-flat shanks, a [stub milling arbor](bt-40-stub-milling-arbor) for face mills and shell mills, and ERG tap collets or GT quick change adaptors for tapping. A [reduction adaptor](bt-50-bt-40-reduction-adaptor), the BT reducer, runs BT-40 holders in a BT-50 spindle.',
      'For the machine table, the 58-piece [clamping kit](clamping-kit-58-pcs) covers T-slots 12 to 20 mm with M10 to M16 studs, and [T-slot nuts](t-slot-nut) are listed from 8 × M6 to 28 × M24. When you enquire, give the taper, ER size and gauge length (for example BT-40 × ER-32 × 100L), or the shank size for collets, with the quantity. Tool rooms and CNC shops in Kolkata, West Bengal can send the whole list in one WhatsApp message.',
    ],
  },
  'lathe-centres': {
    title: 'Choosing a Revolving Centre or Dead Centre',
    paragraphs: [
      'A revolving centre (live centre) turns with the job on its own bearings, so it is the usual choice in the tailstock for turning between centres at speed. A dead centre does not rotate: it is rigid and accurate, used in the headstock or for slower precision work, and needs grease at the point when used in the tailstock. On both, a carbide tipped point outlasts a plain one.',
      'Match the Morse taper of your tailstock quill (revolving centres are listed from MT-1 to MT-6, dead centres to MT-7), then the duty. The [standard revolving centre](male-revolving-centre-carbide-tipped-standard) suits general turning, while the [triple bearing heavy duty](male-revolving-centre-triple-bearing-heavy-duty) and [four bearing extra heavy duty](male-revolving-centre-four-bearing-extra-heavy-duty) centres carry heavier jobs. CNC lathes take [CNC revolving centres](cnc-heavy-duty-revolving-centre) with stub, extended or profiled points, some with interchangeable points, and a [pipe revolving centre](pipe-revolving-centre) with a large cone supports tubes by the bore.',
      'Dead centres come plain or [carbide tipped](dead-centre-carbide-tipped), full or half, along with [CNC dead centres with draw off nut](cnc-dead-centre-with-draw-off-nut) and full carbide 60° centres. When you enquire, give the Morse taper, the type and duty, plain or carbide tipped, and the quantity.',
    ],
  },
  'solid-carbide-tools': {
    title: 'Choosing Solid Carbide End Mills & Carbide Drills',
    paragraphs: [
      'Solid carbide tools are graded by the hardness of the material they cut. HRC45 end mills suit general steel and cast iron, HRC55 tools take harder steel up to about 55 HRC, HRC65 (blue nano coated) end mills are for hardened die steel, and the Miranda Maxx Pro range covers 45 to 60 HRC. Coatings such as TiAlN, TiSiN and AlTiSiN help the edge stand the heat of high-speed CNC machining, while the uncoated 3-flute [end mill for aluminium](endmill-for-aluminium-hrc55) keeps aluminium from sticking to the edge.',
      'Then choose the shape. A [square end mill](square-endmill-hrc55-4-flute) cuts pockets, slots and shoulders: 4 flute for steel, 2 flute for slotting and softer metals. A [ball nose end mill](ballnose-endmill-hrc55-2-flute) machines 3D contours in moulds and dies, long neck end mills reach deep features, and key way end mills cut keyways. Most are listed from Ø1 to 20 mm, in standard, long and extra long lengths.',
      'For holes, start with a 90° [spot drill](spot-drill-90-hrc55), drill with a [solid carbide drill](solid-carbide-drill-hrc55) (Ø0.5 to 20 mm, jobber or stub length) and finish with an H7 [solid carbide reamer](miranda-solid-carbide-reamer-h7); solid carbide centre drills with a 60° countersink are listed too. When you enquire for solid carbide tooling, give the diameter, flutes, length, HRC grade and the material you are cutting, with the quantity.',
    ],
  },
  'indexable-tooling': {
    title: 'Choosing Indexable End Mills, Face Mill Cutters & U-Drills',
    paragraphs: [
      'Indexable milling cutters carry replaceable carbide inserts, so a worn edge is renewed by indexing or changing the insert instead of regrinding the tool. The insert decides the cutter: AP11 and AP16 inserts fit the [BAP end mills](bap-indexable-endmill) and [face mill cutters](bap-face-mill-cutter) for square shoulder and face milling, RP10 and RP12 round inserts fit the [EMR range](emr-indexable-endmill) for profiling and roughing, and LNMU03 inserts fit the [EXN range](exn-indexable-endmill).',
      'Indexable end mills are listed from Ø10 to 40 mm (EXN Ø16 to 32 mm) and face mill cutters from Ø50 to 160 mm (EXN Ø50 to 80 mm). For holes, the [U-drill](u-drill-spmg) takes SPMG inserts and drills Ø10 to 51 mm in 2D, 3D and 4D lengths, on 20, 25, 32 and 40 mm shanks. The number is the hole depth as a multiple of the diameter, so a 3D drill goes three diameters deep.',
      'When you enquire, give the cutter type, diameter, insert size and shank or arbor size, with the quantity. If you are looking for an LNMU03 cutter, an AP16 face mill or a U-drill for indexable milling and drilling in Kolkata, send the details on WhatsApp.',
    ],
  },
  'hss-cutting-tools': {
    title: 'Choosing HSS Drill Bits, Taps & End Mills',
    paragraphs: [
      'HSS drills come in a length for every job: [jobber drills](hss-parallel-shank-jobber-drill) (IS 5101 / DIN 338) for everyday drilling, [stub drills](hss-parallel-shank-stub-drill) for rigid, accurate holes that wander less, long and extra long series for deep holes, and [taper shank drills](hss-taper-shank-drill) (IS 5103 / DIN 345) for drilling machines and lathes with a Morse taper socket. For stainless and tough steel choose HSS-E (cobalt) or TiN coated drills, and a [jobber drill set](hss-jobber-drill-set) of 13 to 51 pieces covers the common sizes.',
      '[HSS taps](hss-hand-tap-metric-coarse) are listed in metric coarse (M2 to M52), metric fine, BSW, BSF, BA, UNC, UNF, BSP and NPT threads. Hand taps come as taper, plug and bottoming. For machine tapping, a [spiral point tap](hss-spiral-point-spiral-flute-tap-metric-coarse) pushes chips ahead in through holes and a spiral flute tap lifts them out of blind holes, while [M35 and M42 taps](m35-m42-hss-tap-metric-coarse) last longer in stainless and alloy steel.',
      'Miranda HSS end mills and [slot drills](hss-slot-drill) in M2 and M42, reamers, core drills, annular cutters and toolbit blanks are listed too. When you enquire, give the diameter, length series and shank for drills, or the thread, pitch and tap type for taps, with the quantity. Workshops looking for a stub drill or HSS tap supplier in Kolkata can send the list on WhatsApp.',
    ],
  },
  'carbide-tipped-tools-burrs': {
    title: 'Choosing Carbide Tipped Tools & Tungsten Carbide Burrs',
    paragraphs: [
      'Carbide tipped tools are lathe tools with a tungsten carbide tip on a steel shank, made to ISO shapes, so choose by the operation: ISO 1 and ISO 2 for turning and facing, ISO 3 for finishing, ISO 5 for facing, ISO 6 knife tools, ISO 7 for parting off, ISO 4 for recessing, ISO 8 and ISO 9 for boring, and 165 and 166 threading tools in 55° (Whitworth) and 60° (metric) forms.',
      'Then match the shank to your tool post. Most types start at 10 × 10 mm, boring tools come with square or round shanks from 8 mm, and right and left hand versions are listed. So are the carbide grades: P20, P30 and P40 for steel, and K05, K10 and K20 for cast iron and non-ferrous metals.',
      '[Tungsten carbide rotary burrs](tungsten-carbide-rotary-burr-cylindrical) fit die grinders for deburring, weld dressing and shaping metal. Pick the shape (cylindrical, ball, oval, flame, tree, cone or inverted cone) and the cut: standard, double cut for smaller chips and a smoother finish, or TiN coated. The 5-piece [carbide burr set](tungsten-carbide-rotary-burr-set) is a good start. When you enquire for carbide tipped tool bits, give the ISO number or type, shank size, hand and grade, with the quantity.',
    ],
  },
  'power-tool-accessories': {
    title: 'Choosing Cutting Wheels, Diamond Blades & Hole Saws',
    paragraphs: [
      'Choose a diamond blade by the material. A [segmented blade](taparia-diamond-cutting-blade-segmented-cut) cuts concrete, brick and stone quickly, a [continuous rim blade](taparia-diamond-cutting-blade-continuous-cut) gives clean, chip-free cuts in tile, ceramic and marble, and a [turbo blade](taparia-diamond-cutting-blade-turbo-cut) sits in between: fast, with a cleaner edge. The 105 to 125 mm sizes suit 4" and 5" angle grinders and marble cutters, and tile cutter blades, granite blades up to 200 mm, cup wheels and TCT wood cutting blades are listed too.',
      'For metal, a thin [cut-off wheel](taparia-cut-off-wheel-gold-series) (105 × 1.0 × 16 mm) runs on a 4" angle grinder. [Bi-metal hole saws](taparia-bi-metal-mini-hole-saw-with-arbor) from 5/16" to 4" cut sheet metal, wood and plastic, [deep hole saws](taparia-deep-hole-saw-and-arbors) run from 14 to 76 mm, and [tungsten carbide tip hole saws](taparia-tungsten-carbide-tip-hole-saw) (16 to 75 mm) handle stainless and harder sheet.',
      'For drilling, use [SDS plus hammer drill bits](taparia-plus-hammer-drill-bits-cross-tip) in a rotary hammer for concrete, [masonry drill bits](taparia-masonry-drill-bits) for brick and plaster, and [HSS jobber drills](taparia-hss-drills-jobbers-series-mm) for metal. When you enquire, give the blade diameter and bore, or the hole or drill size, with the quantity.',
    ],
  },
  'pliers-cutting-tools': {
    title: 'Choosing Taparia Pliers, Cutters & Hacksaw Blades',
    paragraphs: [
      'Taparia pliers are sized by length. A [combination plier](taparia-combination-side-cutting-pliers) (160 to 200 mm) grips, twists and cuts wire, long nose and bent nose pliers reach into tight spots, side cutting pliers and nippers cut wire close, and water pump and locking pliers grip pipe and round parts. For electrical work there are [VDE pliers](taparia-vde-pliers) made to IEC 60900, the standard for insulated hand tools used on live circuits.',
      '[Circlip pliers](taparia-circlip-pliers-pvc-deep-coated-sleeve) are chosen by circlip range, from 8–25 mm to 85–165 mm, in internal, external and bent nose types. [Wire stripping pliers](taparia-wire-stripping-pliers) and the auto wire stripper speed up cable work, [crimping tools](taparia-crimping-tools) cover 0.5 to 70 mm², and for heavier cutting there are [bolt cutters](taparia-bolt-cutters) from 200 to 1200 mm, cable cutters up to 800 mm and wire rope cutters up to 1050 mm.',
      '[Hacksaw blades](taparia-hacksaw-blades-bi-metal) come in all hard carbon steel for straight, accurate cuts, flexible carbon steel that is less likely to snap, and bi-metal for longer life, with hacksaw frames to suit. When you enquire, give the Taparia product number or the size, with the quantity.',
    ],
  },
  'spanners-wrenches': {
    title: 'Choosing Spanner Sets, Pipe Wrenches & Allen Key Sets',
    paragraphs: [
      'A [combination spanner](taparia-combination-spanners-chrome-plated) has an open end and a ring end of the same size, listed from 6 to 50 mm. Double ended open jaw spanners run from 6 × 7 to 75 × 80 mm, and [ring spanners](taparia-ring-spanners-chrome-plated) grip the nut all round, so they take more torque without rounding it. A [combination spanner set](taparia-combination-spanner-sets) or open jaw spanner set covers the everyday sizes. For large nuts on flanges and heavy machinery, [slugging spanners](taparia-slugging-ring-spanners) from 27 to 160 mm are made to be struck with a hammer.',
      'A [pipe wrench](taparia-heavy-duty-pipe-wrenches) is sized by length, from 200 to 1200 mm: the longer the wrench, the larger the pipe it opens to. General purpose, heavy duty and lighter aluminium handle pipe wrenches are listed, and [chain pipe wrenches](taparia-chain-pipe-wrenches) up to 1585 mm take large pipes. Adjustable wrenches run from 150 to 750 mm, and [torque wrenches](taparia-torque-wrenches-standard-type) from 3/8" to 1" drive tighten bolts to a set torque.',
      '[Allen key sets](taparia-allen-key-sets-black-finish-mm) come in mm and inch, in brown or black finish, with ball point, long and extra long versions; a ball point key turns the screw at an angle. Torx keys, folding key sets and [T-handle Allen keys](taparia-t-handle-ball-point-allen-keys) are listed too. When you enquire, give the size or set, with the quantity. For wrenches and spanners in bulk, send the full list on WhatsApp.',
    ],
  },
  'sockets-accessories': {
    title: 'Choosing a Socket Set: Drive Sizes, Sockets & Accessories',
    paragraphs: [
      'Start with the drive size. 1/4" drive suits small fasteners (4 to 14 mm), 3/8" drive light work (6 to 22 mm), and 1/2" drive is the everyday size for vehicles and machinery (8 to 32 mm), while 3/4" and 1" drive take large nuts up to 70 and 80 mm on trucks and heavy equipment. A [1/2" socket set](taparia-socket-sets-12-7mm-1-2-square-drive-bi-hexagonal-and-hexagonal) packs from 6 sockets up to 22 sockets with their accessories in one box, and [1/4" socket sets](taparia-sockets-sets-6-3mm-1-4-square-drive) suit small work.',
      'Then pick the socket type. Hexagonal (6-point) sockets grip hard on tight or worn nuts, bi-hexagonal (12-point) sockets fit on at more angles, deep sockets reach nuts on long studs, and [impact sockets](taparia-impact-sockets-12-7mm-1-2-square-drive-flank-drive-hexagonal) are made for impact wrenches, so use them rather than chrome hand sockets on an impact gun. Bit sockets, torx and E-sockets, spark plug and wheel sockets cover special fasteners.',
      '[Socket accessories](taparia-socket-accessories-12-7mm-1-2-square-drive), from ratchet handles, extension bars and universal joints to T-handles, speeder braces and drive adaptors, are listed for each drive, and the square drive also fits [torque wrenches](taparia-torque-wrenches-standard-type). When you enquire, give the drive, the sizes or set and the quantity. For socket sets in bulk, send the full list on WhatsApp.',
    ],
  },
  'screwdrivers-bits': {
    title: 'Choosing a Taparia Screwdriver Set, Bits & Line Testers',
    paragraphs: [
      'Match the tip to the screw: flat (slotted) blades by width and length, Phillips by tip number (PH 00 to PH 4) and torx by size. A [Taparia screwdriver set](taparia-screw-driver-sets) with 5 to 8 blades, or a screwdriver kit, covers most jobs, [precision screwdriver sets](taparia-precision-screw-driver-sets) are for electronics and small screws, and two-in-one screwdrivers carry flat and Phillips tips in one handle.',
      'For electrical work, use [insulated screwdrivers](taparia-insulated-screw-drivers), and check whether a line is live with a [line tester](taparia-line-testers) or digital tester before you start. Stubby screwdrivers fit tight spaces, and striking screwdrivers can be hit with a hammer to free stuck screws.',
      'Screwdriver bits are listed in Phillips, Pozidriv, torx, flat and hex, single and double ended, with bit drivers and bit sets: an [80-piece bit set](taparia-screw-driver-bits-set-80-pcs), a [32-piece power tool bits set](taparia-power-tool-bits-set-32-pcs) and impact driver bit sets. When you enquire, give the tip type and size, the blade length or set, and the quantity.',
    ],
  },
  'hammers-chisels-files': {
    title: 'Choosing Hammers, Chisels, Punches & Files',
    paragraphs: [
      'Choose a hammer by the job and the head weight. A [ball pein hammer](taparia-hammer-with-handle-ball-pein-and-cross-pein) (110 to 800 g) is the engineering hammer for metalwork and riveting, a claw hammer drives and pulls nails, club hammers (800 g to 1.5 kg) drive chisels and punches, and [sledge hammers](taparia-sledge-hammer-with-hickory-wood-handle) up to 6.3 kg with a hickory handle (heads alone up to 9 kg) do heavy breaking and driving. Soft faced hammers do not mark finished surfaces, and fibreglass handle hammers are listed from 110 g to 9 kg.',
      'Octagonal and flat chisels, including chisels with a rubber grip, cut and chip metal, and pneumatic and SDS chisels fit power tools. Centre punches mark a point before drilling, drift punches drive out pins, and leather punches cut clean holes in leather, gaskets and rubber.',
      'Engineering files are listed in flat, hand, round, half round, three square and square shapes, in bastard, second cut and smooth, along with wood rasps, saw files and [needle file sets](taparia-needle-files-sets) for fine work. When you enquire, give the weight or length, the shape and cut, and the quantity.',
    ],
  },
  'industrial-hand-tools': {
    title: 'Choosing Tap Handles, Die Handles, Gauges & Letter Punches',
    paragraphs: [
      'For hand tapping, use an [adjustable tap handle](adjustable-tap-handle-steel) sized to the tap (handles run from 1/16"–1/4" taps up to 3"), or a [T-handle tap wrench](t-handle-tap-wrench) (Nos. A to D) for small taps in tight places. Round dies need a [round die handle](round-die-handle) that matches the outside diameter of the die, from 13/16" to 5".',
      'To check work, the engineering try square (2" to 24" blade) tests right angles, the protractor and depth gauge measure angles and depths, the radius gauge checks fillets and curves, and a [thread gauge](thread-gauge) identifies the pitch in mm, inch or both. [Expanding hand reamers](expanding-adjustable-hand-reamer) are set to size for repair and fitting work.',
      '[Letter and figure punches](marking-letter-figure-punches) stamp part numbers, dates and codes into metal, from 1/32" to 1" (1 to 25 mm) character size, with [dotted](dotted-letter-figure-punches) and [reverse](reverse-letter-figure-punch-sets) letter sets too. When you enquire, give the size, whether you need letters, figures or both, and the quantity.',
    ],
  },
  'workshop-equipment': {
    title: 'Choosing a Bench Vice, Clamps, Hydraulic Jack & Tool Kit',
    paragraphs: [
      'A [bench vice](taparia-bench-vice-fixed-base) is chosen by jaw opening (75 to 200 mm are listed) to suit the largest job you hold, and a [pipe vice](taparia-pipe-vices) holds round pipe from 10 mm up to 165 mm. To hold work on a bench or welding table, [C-clamps](taparia-c-clamps) open from 55 to 305 mm and [F-clamps](taparia-f-clamps-heavy-duty) up to 600 mm, in light and heavy duty.',
      'Choose a [hydraulic bottle jack](taparia-hydraulic-bottle-jack) by load: 2 to 50 tonne capacities are listed, each with a spare kit. A [hydraulic trolley jack](taparia-hydraulic-trolley-jack) (1.5 to 3 tonne) rolls under vehicles, and a [jack stand](taparia-jack-stand) holds the load once it is raised. Never work under a load held only by a jack.',
      'For a complete set, choose from [Taparia tool kits](taparia-tool-kits), universal sets and professional, plumber and two-wheeler kits, with tool boxes, tool bags and tool trolleys to carry them. Bearing pullers, grease guns and pumps, spirit levels, riveters and carpenter tools are listed too. When you enquire, give the product, the size or capacity, and the quantity.',
    ],
  },
  'non-sparking-tools': {
    title: 'Choosing Non-Sparking Tools: Beryllium Copper or Aluminium Bronze',
    paragraphs: [
      'Non sparking tools are used where a spark from a steel tool could ignite gas, vapour or dust: refineries, oil and gas, petrochemical and chemical plants, paint shops and mines. Taparia non sparking tools are listed in two alloys, beryllium copper (BE-CU), the harder and stronger of the two, and aluminium bronze (AL-BR), the usual alternative for general maintenance.',
      'The range covers [non sparking spanners](taparia-non-sparking-combination-spanners) (combination, open jaw, ring and slugging) along with [adjustable wrenches](taparia-non-sparking-adjustable-wrenches), [pipe wrenches](taparia-non-sparking-pipe-wrench), Allen keys, pliers, [hammers](taparia-non-sparking-hammer-with-handle-ball-pein) and sledge hammers, chisels, screwdrivers, hacksaws, files, and 1/2" and 3/4" drive [sockets and socket sets](taparia-non-sparking-12-7mm-1-2-square-drive-socket-set-28-pcs).',
      'These alloys are softer than tool steel, so use the right size of tool for the job. Non-sparking tools reduce the risk of sparks, but they do not replace your hazardous area permit and gas testing. When you enquire, give the tool, the size and the alloy (BE-CU or AL-BR), with the quantity.',
    ],
  },
  'hoists-pulley-blocks': {
    title: 'Choosing a Chain Pulley Block, Electric Hoist or Spring Balancer',
    paragraphs: [
      'A [chain pulley block](chain-pulley-block-b-series) is the simplest way to lift: pull the hand chain and the load rises on the load chain. Choose a capacity at or above your heaviest load, and the height of lift you need. The [heavy duty T Series](heavy-duty-chain-pulley-block-t-series) runs from 0.5 to 50 t, the B Series from 1 to 20 t, and the [Revolve Series](chain-pulley-block-revolve-series) (1 to 10 t) has a 360° hand chain guide, so you can pull from the side and stay out of the danger zone. For lifting or pulling at an angle in tight spaces, a [ratchet lever hoist](ratchet-lever-hoist) covers 0.25 to 9 t.',
      'For frequent lifting, an [electric chain hoist](electric-chain-hoist-single-speed) saves time and effort: single speed models from 0.5 to 10 t, and [dual speed (inverter) hoists](electric-chain-hoist-dual-speed) from 0.3 to 5 t with a slow speed for careful positioning. Hang a block or hoist on a [gear trolley](gear-trolley) (1 to 20 t) or [electric trolley](electric-trolley) to travel along an I-beam.',
      'A [spring balancer](spring-balancer) takes the weight of a hand tool, such as a drill, nut runner or welding gun, so it hangs ready at working height. Choose the range that matches the tool weight, from 1–3 kg up to 22–30 kg. Wire rope pulley blocks, cable pullers and pulling and lifting machines are listed too. When you enquire, give the capacity, the height of lift and the quantity.',
    ],
  },
  'lifting-chain-rigging': {
    title: 'Choosing D Shackles, Eye Bolts, Turnbuckles & G80 Chain',
    paragraphs: [
      'Every lifting fitting is rated by its working load limit (WLL), the maximum load it may lift in service. Choose a WLL at or above the load on that part of the rig, and remember that the load on each leg of a multi-leg sling rises as the angle between the legs widens.',
      'A [D shackle](screw-pin-dee-shackle) (dee shackle) connects in a straight line, while a [bow shackle](screw-pin-bow-shackle) has a rounder body for multi-leg slings. Screw pin shackles are quick to fit and remove, and [nut bolt shackles](nut-bolt-dee-shackle) suit longer-term or rotating loads; shackles are listed from 0.5 to 55 t, with nut bolt bow shackles up to 150 t. [Eye bolts](eye-bolt-din-580-galvanised) to DIN 580 screw into a tapped hole and lose capacity when pulled at an angle, so for angled lifts use a [rotating lifting eye bolt](g80-rotating-lifting-eye-bolt). [Turnbuckles](drop-forged-galvanised-turnbuckle-jaw-and-jaw) tension guy ropes, stays and lashings, and [wire rope clamps](galvanised-heavy-duty-wire-rope-clamp) form rope eyes.',
      '[G80 lifting chain](g80-alloy-steel-lifting-chain), grade 80 alloy steel listed from 6 to 32 mm, makes chain slings with G80 [master links](g80-master-link), connecting links and hooks: sling, self locking, grab and foundry hooks. G100 hook assemblies are listed for a higher grade. When you enquire, give the WLL, the type (D or bow, screw pin or nut bolt) or the chain size, with the quantity.',
    ],
  },
  'slings-lashing': {
    title: 'Choosing Webbing Slings, Round Slings & Ratchet Lashing',
    paragraphs: [
      '[Polyester webbing slings](polyester-duplex-webbing-sling) and [round slings](polyester-round-sling) are light, flexible and gentle on finished surfaces. Webbing slings are made to EN 1492-1, and both are colour coded by working load limit (violet 1 t, green 2 t, yellow 3 t, grey 4 t, red 5 t, brown 6 t, blue 8 t, orange 10 t and above), so the capacity can be read at a glance. Webbing slings are listed from 1 to 50 t and round slings from 1 to 100 t.',
      'Choose the length and the hitch. A choke hitch lowers the capacity to 0.8 of a straight lift, and a basket hitch with vertical legs doubles it; each product lists the full table. Keep slings away from sharp edges: the [anti-cutting sling sleeves](anti-cutting-sling-sleeve), anti-abrasive sleeves and [edge protectors](sling-edge-protector) listed here protect both the sling and the load.',
      'For transport, a [ratchet lashing belt](cargo-lashing-ratchet) (cargo lashing ratchet, 25 to 100 mm wide) secures loads on trucks and trailers, and a [ratchet load binder](ratchet-load-binder) tensions chain. When you enquire, give the WLL, effective length and quantity for slings, or the width and length for lashing.',
    ],
  },
  'lifting-clamps-magnets': {
    title: 'Choosing Plate Lifting Clamps & Magnetic Lifters',
    paragraphs: [
      'Match the clamp to how the plate will hang. A [vertical plate lifting clamp](vertical-plate-lifting-clamp) (1 to 10 t) lifts plates upright and turns them from flat to vertical, a [horizontal plate lifting clamp](horizontal-plate-lifting-clamp-pdb-type) (1 to 16 t), used in pairs, lifts plates flat, [lateral plate clamps](lateral-plate-clamp) lift from the side, and [universal clamps](universal-plate-lifting-clamp) work in more than one direction. Check the jaw opening against your plate thickness as well as the capacity.',
      'A [permanent magnet lifter](permanent-magnet-lifter) (100 to 5000 kg, safety factor 3:1) lifts flat steel plate and blocks without any power supply: turn the lever on, lift, and turn it off to release. Holding force drops on thin, rough, painted or curved steel, so allow a margin.',
      'For other loads, a [beam clamp](beam-clamp) (1 to 10 t) gives a hanging point on an I-beam for a pulley block, [pipe lifting clamps](pipe-lifting-clamp-tph-type) hold pipes, and the [drum lifter](drum-lifter) handles steel oil drums. When you enquire, give the capacity, the plate thickness or beam flange width, and the quantity.',
    ],
  },
  'material-handling': {
    title: 'Choosing a Hand Pallet Truck, Stacker or Lifting Table',
    paragraphs: [
      'A [hand pallet truck](hand-pallet-truck) (pallet jack) moves loaded pallets across a warehouse or factory floor. The trucks listed carry 2.5, 3 and 5 tonnes, with fork lengths of 1150 and 1220 mm and overall widths of 550 and 685 mm, so check these against your pallets. They need a smooth, level floor; for uneven or outdoor ground there is a [rough terrain truck](rough-terrain-truck) with pneumatic tyres.',
      'To raise a load as well as move it, a [scissor lift pallet truck](scissor-lift-pallet-truck) lifts the pallet up to 800 mm for working at a press or conveyor, and a [hand stacker](hand-stacker) (1 to 2 t, lifting to 1600 mm) or [electric stacker](electric-stacker) (1.5 t) puts pallets onto racks. A [hydraulic lifting table](hydraulic-lifting-table) (500 or 1000 kg) brings work to a comfortable height for loading and assembly.',
      '[Drum trolleys](drum-trolley) and drum lifter cum tilters handle oil drums, [industrial skates](industrial-skates) (6 to 18 t) move machinery, and [wire mesh containers](wire-mesh-container) store and stack parts. If you are looking for a material handling equipment supplier in Kolkata, give the capacity, lift height or fork size and the quantity on WhatsApp.',
    ],
  },
};
