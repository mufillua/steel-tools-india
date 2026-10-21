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
