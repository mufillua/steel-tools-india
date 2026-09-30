import { Category } from '../models/category.model';

/**
 * Top-level catalogue categories, derived from the four supplied documents:
 *   RR-2025   R★R Brand Machine Tools Accessories — Master Price List, w.e.f. 15-01-2025 (28 pp, scanned)
 *   RR-2026   R★R Brand Supplementary Price List (Edition 5), last updated 01-08-2026 (10 pp)
 *   RR-CT     R★R Brand Carbide Cutting Tools, w.e.f. 19-09-2026 (16 pp)
 *   RR-HT     R★R Brand Hand Tools & Letter / Figure Punchings, w.e.f. 01-06-2026 (16 pp) — page 3 only, by client request
 *   MIRANDA   Miranda Products Price List DPM01052026 v3 (Dormer Pramet India) — text only
 *   TAPARIA   Taparia Tools Ltd. Price List April 2026 (44 pp) — all product tables (sections 1–55)
 *
 * Product records reference these slugs. Prices are intentionally not carried.
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'machine-tool-accessories',
    name: 'Machine Tool Accessories',
    description:
      'BT, ISO, HSK, CAT, SK, RBT, Morse taper and R8 tooling — ER collet chucks, stub milling arbors, side lock holders, reduction sockets, collets, drill chucks, T-slot and flange nuts.',
    icon: 'taper',
    brands: ['R★R Brand'],
    sources: ['RR-2025', 'RR-2026'],
    highlights: ['BT-50 / ISO-50 tooling', 'ER collet chucks', 'Collets', 'T-slot & flange nuts'],
  },
  {
    slug: 'lathe-centres',
    name: 'Revolving & Dead Centres',
    description:
      'Carbide tipped machine tools — male revolving centres (standard, heavy and extra heavy duty), CNC revolving centres, dead centres and carbide tipped spare points.',
    icon: 'centre',
    brands: ['R★R Brand'],
    sources: ['RR-2025', 'RR-2026'],
    highlights: ['Revolving centres', 'CNC revolving centres', 'Dead centres', 'Spare points'],
  },
  {
    slug: 'solid-carbide-tools',
    name: 'Solid Carbide Tools',
    description:
      'Solid carbide drills, spot drills, square, ball nose, key way, long neck and aluminium end mills, plus solid carbide centre drills and reamers.',
    icon: 'solid-carbide',
    brands: ['R★R Brand', 'Miranda'],
    sources: ['RR-CT', 'MIRANDA'],
    highlights: ['Solid carbide drills', 'Square end mills', 'Ball nose end mills', 'Reamers'],
  },
  {
    slug: 'indexable-tooling',
    name: 'Indexable Tooling',
    description:
      'Indexable end mills and face mill cutters for AP / RP / LNMU inserts, and SPMG U-drills in 2D, 3D and 4D lengths.',
    icon: 'indexable',
    brands: ['R★R Brand'],
    sources: ['RR-CT'],
    highlights: ['Indexable end mills', 'Face mill cutters', 'U-drills'],
  },
  {
    slug: 'hss-cutting-tools',
    name: 'HSS Cutting Tools',
    description:
      'HSS toolbit blanks, jobber, stub, long and taper shank drills, centre drills, end mills and slot drills, reamers, taps, core drills and annular cutters.',
    icon: 'hss',
    brands: ['Miranda'],
    sources: ['MIRANDA'],
    highlights: ['Toolbit blanks', 'HSS drills', 'HSS taps', 'Reamers & annular cutters'],
  },
  {
    slug: 'carbide-tipped-tools-burrs',
    name: 'Carbide Tipped Tools & Burrs',
    description:
      'Tungsten carbide tipped turning, facing, boring, parting and threading tools, and tungsten carbide rotary burrs.',
    icon: 'carbide-tipped',
    brands: ['Miranda'],
    sources: ['MIRANDA'],
    highlights: ['Turning tools', 'Boring tools', 'Threading tools', 'Rotary burrs'],
  },
  {
    slug: 'power-tool-accessories',
    name: 'Cutting Wheels, Hole Saws & Drill Bits',
    description:
      'Diamond, tile, granite and TCT wood cutting blades, cup wheels, cut-off wheels, abrasive paper and velcro discs, bi-metal, deep and carbide tip hole saws, masonry, HSS and SDS hammer drill bits.',
    icon: 'disc',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Diamond blades', 'Cut-off wheels', 'Hole saws', 'Drill bits'],
  },
  {
    slug: 'pliers-cutting-tools',
    name: 'Pliers & Cutting Tools',
    description:
      'Combination, long nose, side cutting, circlip, VDE, locking and water pump pliers, nippers and wire strippers, crimping tools, bolt, cable, tin and wire rope cutters, pipe cutters, snap-off knives and hacksaws.',
    icon: 'pliers',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Pliers', 'Wire strippers', 'Bolt & cable cutters', 'Hacksaws'],
  },
  {
    slug: 'spanners-wrenches',
    name: 'Spanners, Wrenches & Keys',
    description:
      'Adjustable wrenches, open jaw, ring, combination and slugging spanners, L, box and tubular spanners, pipe and torque wrenches, and Allen, torx and T-handle keys.',
    icon: 'spanner',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Combination spanners', 'Slugging spanners', 'Pipe & torque wrenches', 'Allen keys'],
  },
  {
    slug: 'sockets-accessories',
    name: 'Sockets & Socket Sets',
    description:
      '1/4", 3/8", 1/2", 3/4" and 1" square drive sockets — flank drive, deep, impact, bit, torx and E-sockets — with ratchets, extensions, accessories and complete socket sets.',
    icon: 'socket',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['1/2" drive sockets', 'Impact sockets', 'Socket sets', 'Accessories'],
  },
  {
    slug: 'screwdrivers-bits',
    name: 'Screwdrivers, Bits & Testers',
    description:
      'Flat, Phillips, insulated, two-in-one, torx, stubby and striking screwdrivers, screwdriver sets and kits, line and digital testers, screwdriver bits, bit drivers and bit sets.',
    icon: 'screwdriver',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Screwdrivers', 'Screwdriver sets', 'Bits & bit sets', 'Line testers'],
  },
  {
    slug: 'hammers-chisels-files',
    name: 'Hammers, Chisels, Punches & Files',
    description:
      'Ball pein, claw, club, machinist, sledge, soft faced and fibreglass handle hammers, chisels, centre, drift and leather punches, a steel axe, and machinist, wood rasp, saw and needle files.',
    icon: 'hammer',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Hammers', 'Chisels', 'Punches', 'Files'],
  },
  {
    slug: 'industrial-hand-tools',
    name: 'Tapping, Measuring & Marking Tools',
    description:
      'Letter & figure marking punches, adjustable tap handles, round die handles, T-handle tap wrenches, adjustable hand reamers, try squares, protractors and depth, thread and radius gauges.',
    icon: 'hand-tool',
    brands: ['R★R Brand'],
    sources: ['RR-2025', 'RR-2026', 'RR-HT'],
    highlights: ['Letter & figure punches', 'Tap & die handles', 'Hand reamers', 'Gauges'],
  },
  {
    slug: 'workshop-equipment',
    name: 'Workshop Equipment & Tool Kits',
    description:
      'C and F clamps, pipe and bench vices, bearing pullers, hydraulic jacks and stands, grease guns and pumps, tool bags, kits, boxes and trolleys, carpenter tools, riveters, spirit levels and more.',
    icon: 'toolbox',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Tool kits & boxes', 'Clamps & vices', 'Jacks & pullers', 'Grease guns'],
  },
  {
    slug: 'non-sparking-tools',
    name: 'Non-Sparking Tools',
    description:
      'Non-sparking spanners, wrenches, pliers, hammers, chisels, screwdrivers, Allen keys, hacksaws, sockets and files — each listed in beryllium copper (BE-CU) and aluminium bronze (AL-BR).',
    icon: 'non-sparking',
    brands: ['Taparia'],
    sources: ['TAPARIA'],
    highlights: ['Spanners', 'Pliers & hammers', 'Sockets', 'BE-CU / AL-BR'],
  },
];
