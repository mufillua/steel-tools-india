/**
 * Search headings for the category landing pages (/categories/<slug>).
 *
 * Each heading leads with the product names buyers in India actually type into Google, picked from Google
 * search-volume data (Oct 2026, India) and limited to products that are really in that category, e.g.
 * "spring balancer" (~18,100 searches/month), "hand pallet truck" (~6,600), "d shackle" (~6,600),
 * "chain pulley block" (~2,900), "allen key set" / "pipe wrench" (~22,200 each), "taparia screwdriver set" (~6,600).
 *
 * Used for: the page <title> ("<heading> in Kolkata | Steel Tools India"), the page's H1 and the start of its
 * meta description. The category's own name (menus, filters, breadcrumbs) is unchanged.
 * If a category's products change, check its heading still only names products it contains.
 */
export const CATEGORY_SEO_HEADINGS: Record<string, string> = {
  'machine-tool-accessories': 'ER Collet Chucks, BT-40 Tool Holders & Collets',
  'lathe-centres': 'Revolving Centres & Dead Centres for Lathe & CNC',
  'solid-carbide-tools': 'Solid Carbide End Mills, Ball Nose & Carbide Drills',
  'indexable-tooling': 'Indexable End Mills, Face Mill Cutters & U-Drills',
  'hss-cutting-tools': 'Miranda HSS Drill Bits, Taps, End Mills & Tool Bits',
  'carbide-tipped-tools-burrs': 'Carbide Tipped Tools & Tungsten Carbide Burrs',
  'power-tool-accessories': 'Cutting Wheels, Diamond Blades, Hole Saws & Drill Bits',
  'pliers-cutting-tools': 'Taparia Pliers, Cutters & Hacksaw Blades',
  'spanners-wrenches': 'Taparia Spanners, Pipe Wrenches & Allen Key Sets',
  'sockets-accessories': 'Taparia Socket Sets & Sockets, 1/4" to 1" Drive',
  'screwdrivers-bits': 'Taparia Screwdriver Sets, Bits & Line Testers',
  'hammers-chisels-files': 'Taparia Hammers, Chisels, Punches & Files',
  'industrial-hand-tools': 'Tap Handles, Die Handles, Gauges & Letter Punch Sets',
  'workshop-equipment': 'Bench Vice, Clamps, Hydraulic Jacks & Tool Kits',
  'non-sparking-tools': 'Taparia Non-Sparking Spanners, Hammers & Wrenches',
  'hoists-pulley-blocks': 'Chain Pulley Blocks, Electric Hoists & Spring Balancers',
  'lifting-chain-rigging': 'D Shackles, Eye Bolts, Turnbuckles & G80 Lifting Chain',
  'slings-lashing': 'Webbing Slings, Round Slings & Ratchet Lashing',
  'lifting-clamps-magnets': 'Plate Lifting Clamps & Magnetic Lifters',
  'material-handling': 'Hand Pallet Trucks, Stackers & Lifting Tables',
};

/** Brands buyers search by name ("taparia pipe wrench", "miranda drill") — put in front of product titles. */
export const SEARCHED_BRANDS = ['Taparia', 'Miranda'];

/**
 * "Popular searches" links on the home page: the product names people search most (Google search volume, India,
 * Oct 2026), each linking straight to that product's page. The home page is the page Google visits most often,
 * so these links are the quickest way for Google to find and index those product pages.
 * Every slug must exist (checked by product.service.spec.ts).
 */
export const POPULAR_SEARCHES: { label: string; slug: string }[] = [
  { label: 'Hand Pallet Truck', slug: 'hand-pallet-truck' },
  { label: 'Spring Balancer', slug: 'spring-balancer' },
  { label: 'Chain Pulley Block', slug: 'chain-pulley-block-b-series' },
  { label: 'Electric Chain Hoist', slug: 'electric-chain-hoist-single-speed' },
  { label: 'Ratchet Lever Hoist', slug: 'ratchet-lever-hoist' },
  { label: 'Hand Stacker', slug: 'hand-stacker' },
  { label: 'Webbing Sling', slug: 'polyester-duplex-webbing-sling' },
  { label: 'D Shackle', slug: 'screw-pin-dee-shackle' },
  { label: 'Eye Bolt', slug: 'eye-bolt-din-580-galvanised' },
  { label: 'Turnbuckle', slug: 'drop-forged-galvanised-turnbuckle-jaw-and-jaw' },
  { label: 'G80 Lifting Chain', slug: 'g80-alloy-steel-lifting-chain' },
  { label: 'Plate Lifting Clamp', slug: 'vertical-plate-lifting-clamp' },
  { label: 'Magnetic Lifter', slug: 'permanent-magnet-lifter' },
  { label: 'Ratchet Lashing Belt', slug: 'cargo-lashing-ratchet' },
  { label: 'Taparia Pipe Wrench', slug: 'taparia-heavy-duty-pipe-wrenches' },
  { label: 'Taparia Allen Key Set', slug: 'taparia-allen-key-sets-black-finish-mm' },
  { label: 'Taparia Spanner Set', slug: 'taparia-combination-spanner-sets' },
  { label: 'Taparia Socket Set', slug: 'taparia-socket-sets-12-7mm-1-2-square-drive-bi-hexagonal-and-hexagonal' },
  { label: 'Taparia Screwdriver Set', slug: 'taparia-screw-driver-sets' },
  { label: 'Taparia Pliers', slug: 'taparia-combination-side-cutting-pliers' },
  { label: 'Bench Vice', slug: 'taparia-bench-vice-fixed-base' },
  { label: 'Hydraulic Bottle Jack', slug: 'taparia-hydraulic-bottle-jack' },
  { label: 'Hole Saw', slug: 'taparia-bi-metal-mini-hole-saw-with-arbor' },
  { label: 'BT-40 ER Collet Chuck', slug: 'bt-40-er-collet-chuck' },
  { label: 'ER Collet', slug: 'er-collet' },
  { label: 'Revolving Centre', slug: 'male-revolving-centre-carbide-tipped-standard' },
  { label: 'Carbide End Mill', slug: 'miranda-4-flute-solid-carbide-end-mill-standard' },
  { label: 'HSS Drill Set', slug: 'hss-jobber-drill-set' },
  { label: 'Taper Shank Drill', slug: 'hss-taper-shank-drill' },
  { label: 'Carbide Burr Set', slug: 'tungsten-carbide-rotary-burr-set' },
];
