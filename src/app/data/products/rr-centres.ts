import { Product, ProductSource } from '../../models/product.model';
import { rows } from '../variant-builders';

/**
 * R★R Brand revolving & dead centres.
 * Carbide tipped variants: Supplementary Price List Ed. 5 (01-08-2026), pages 6–8.
 * Plain variants, pipe centres, wedge: Master Price List (15-01-2025), pages 4–6.
 * A variant is only created where the source table has an entry (not "----").
 */

const BRAND = 'R★R Brand';
const CEN = 'lathe-centres';
const img = (file: string) => `assets/products/${CEN}/${file}.webp`;
const src25 = (page: number, section: string): ProductSource => ({ doc: 'RR-2025', page, section });

const MT = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `MT-${from + i}`);
/** Build [model, type] rows for each model in `models` and each type. */
const grid = (models: string[], types: string[]) => models.flatMap((m) => types.map((t) => [m, t]));
const byModel = (a: Record<string, string>) => `${a['Model']} · ${a['Type']}`;

export const RR_CENTRE_PRODUCTS: Product[] = [
  {
    slug: 'male-revolving-centre-carbide-tipped-standard',
    name: 'Male Revolving Centre (Standard)',
    category: CEN,
    subcategory: 'Revolving Centres',
    brand: BRAND,
    summary: 'MT-1 to MT-6 · plain or carbide tipped',
    description:
      'Standard male revolving centre, listed for MT-1 to MT-6 with a plain or carbide tipped point. Spare points are listed separately: plain for MT-2 to MT-6 and carbide tipped for MT-1 to MT-6.',
    images: [img('male-revolving-centre-standard')],
    specifications: [
      { label: 'Type', value: 'Male revolving centre — standard' },
      { label: 'Point', value: 'Plain or carbide tipped' },
      { label: 'Morse taper', value: 'MT-1 to MT-6' },
      { label: 'Spare points', value: 'Plain (MT-2 to MT-6), carbide tipped (MT-1 to MT-6)' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      [
        ...grid(MT(1, 6), ['Plain centre', 'Carbide tipped centre']),
        ...grid(MT(2, 6), ['Plain spare point']),
        ...grid(MT(1, 6), ['Carbide tipped spare point']),
      ],
      byModel,
    ),
    source: { doc: 'RR-2026', page: 6, section: 'Male Revolving Center (Carbide Tipped - Standard)' },
    otherSources: [src25(5, 'Male Revolving Centers')],
    featured: true,
  },
  {
    slug: 'male-revolving-centre-triple-bearing-heavy-duty',
    name: 'Male Revolving Centre Triple Bearing (Heavy Duty)',
    category: CEN,
    subcategory: 'Revolving Centres',
    brand: BRAND,
    summary: 'MT-1 to MT-6 · triple bearing',
    description:
      'Heavy duty triple-bearing male revolving centre, listed for MT-1 to MT-6 with a plain or carbide tipped point, with plain and carbide tipped spare points for each model.',
    images: [img('male-revolving-centre-triple-bearing')],
    specifications: [
      { label: 'Type', value: 'Male revolving centre — heavy duty' },
      { label: 'Bearings', value: 'Triple bearing' },
      { label: 'Point', value: 'Plain or carbide tipped' },
      { label: 'Morse taper', value: 'MT-1 to MT-6' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      grid(MT(1, 6), ['Plain centre', 'Carbide tipped centre', 'Plain spare point', 'Carbide tipped spare point']),
      byModel,
    ),
    source: {
      doc: 'RR-2026',
      page: 6,
      section: 'Male Revolving Center Triple Bearing (Carbide Tipped - Heavy Duty)',
    },
    otherSources: [src25(5, 'Male Revolving Centers Triple Bearing (Heavy Duty)')],
  },
  {
    slug: 'male-revolving-centre-four-bearing-extra-heavy-duty',
    name: 'Male Revolving Centre Four Bearing (Extra Heavy Duty)',
    category: CEN,
    subcategory: 'Revolving Centres',
    brand: BRAND,
    summary: 'MT-3 to MT-5 · four bearing',
    description:
      'Extra heavy duty four-bearing male revolving centre, listed for MT-3, MT-4 and MT-5 with a plain or carbide tipped point, with plain and carbide tipped spare points for each model.',
    images: [img('male-revolving-centre-four-bearing')],
    specifications: [
      { label: 'Type', value: 'Male revolving centre — extra heavy duty' },
      { label: 'Bearings', value: 'Four bearing' },
      { label: 'Point', value: 'Plain or carbide tipped' },
      { label: 'Morse taper', value: 'MT-3, MT-4, MT-5' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      grid(MT(3, 5), ['Plain centre', 'Carbide tipped centre', 'Plain spare point', 'Carbide tipped spare point']),
      byModel,
    ),
    source: {
      doc: 'RR-2026',
      page: 6,
      section: 'Male Revolving Center Four Bearing (Carbide Tipped - Extra Heavy Duty)',
    },
    otherSources: [src25(5, 'Male Revolving Centers Four Bearing (Extra Heavy Duty)')],
  },
  {
    slug: 'cnc-heavy-duty-revolving-centre',
    name: 'CNC Heavy Duty Revolving Centre',
    category: CEN,
    subcategory: 'CNC Revolving Centres',
    brand: BRAND,
    summary: 'MT-2 to MT-5 · stub, extended, profiled',
    description:
      'Heavy duty revolving centre for high speed CNC turning. Plain points are listed for MT-2 to MT-5 in stub, extended and profiled forms; carbide tipped points for MT-3 to MT-5 in stub and extended forms.',
    images: [img('cnc-heavy-duty-revolving-centre')],
    specifications: [
      { label: 'Application', value: 'High speed CNC turning' },
      { label: 'Plain point', value: 'Stub, extended, profiled — MT-2 to MT-5' },
      { label: 'Carbide tipped point', value: 'Stub, extended — MT-3 to MT-5' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      [
        ...grid(MT(2, 5), ['Plain stub', 'Plain extended', 'Plain profiled']),
        ...grid(MT(3, 5), ['Carbide tipped stub', 'Carbide tipped extended']),
      ],
      byModel,
    ),
    source: {
      doc: 'RR-2026',
      page: 6,
      section: 'CNC Heavy Duty Revolving Center (Carbide Tipped – High Speed CNC HD R)',
    },
    otherSources: [src25(4, 'CNC Heavy Duty Revolving Centers (for high speed CNC turning applications)')],
    featured: true,
  },
  {
    slug: 'cnc-hd-r-centre-interchangeable',
    name: 'CNC Heavy Duty Revolving Centre — Interchangeable Point',
    category: CEN,
    subcategory: 'CNC Revolving Centres',
    brand: BRAND,
    summary: 'MT-3 to MT-5 · stub, extended, profiled',
    description:
      'Heavy duty revolving centre with interchangeable point for high speed CNC turning, listed for MT-3, MT-4 and MT-5 with plain or carbide tipped points in stub, extended and profiled forms.',
    images: [img('cnc-hd-r-centre-interchangeable')],
    specifications: [
      { label: 'Application', value: 'High speed CNC turning' },
      { label: 'Point', value: 'Interchangeable — plain or carbide tipped' },
      { label: 'Point forms', value: 'Stub, extended, profiled' },
      { label: 'Morse taper', value: 'MT-3, MT-4, MT-5' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      grid(MT(3, 5), [
        'Plain stub',
        'Plain extended',
        'Plain profiled',
        'Carbide tipped stub',
        'Carbide tipped extended',
        'Carbide tipped profiled',
      ]),
      byModel,
    ),
    source: {
      doc: 'RR-2026',
      page: 7,
      section: 'CNC HD R Center Interchangeable Model (Carbide Tipped – High Speed RC with Int. Point)',
    },
    otherSources: [src25(4, 'CNC Heavy Duty Rev / Centers with Interchangeable Point')],
  },
  {
    slug: 'carbide-tipped-spare-point-interchangeable',
    name: 'Spare Point for Interchangeable Revolving Centre',
    category: CEN,
    subcategory: 'Spare Points & Accessories',
    brand: BRAND,
    summary: 'MT-3 to MT-5 · plain or carbide tipped',
    description:
      'Spare point for revolving centres with interchangeable point, listed for MT-3, MT-4 and MT-5 in stub, extended and profiled forms, plain or carbide tipped.',
    images: [img('carbide-tipped-spare-points')],
    specifications: [
      { label: 'For', value: 'Revolving centre with interchangeable point' },
      { label: 'Forms', value: 'Stub, extended, profiled' },
      { label: 'Point', value: 'Plain or carbide tipped' },
      { label: 'Model', value: 'MT-3, MT-4, MT-5' },
    ],
    variantAxes: ['Model', 'Type'],
    variants: rows(
      ['Model', 'Type'],
      grid(MT(3, 5), [
        'Plain stub',
        'Plain extended',
        'Plain profiled',
        'Carbide tipped stub',
        'Carbide tipped extended',
        'Carbide tipped profiled',
      ]),
      byModel,
    ),
    source: {
      doc: 'RR-2026',
      page: 7,
      section: 'Carbide Tipped Spare Point (Carbide Tipped – CNC RC with Int. Point)',
    },
    otherSources: [src25(4, 'Spare Point (for Interchangeable Revolving Center)')],
  },
  {
    slug: 'wedge-for-interchangeable-point',
    name: 'Wedge for Interchangeable Point',
    category: CEN,
    subcategory: 'Spare Points & Accessories',
    brand: BRAND,
    summary: 'MT-3, MT-4, MT-5',
    description:
      'Wedge for removing the interchangeable point from the female sleeve of an interchangeable revolving centre, listed for MT-3, MT-4 and MT-5.',
    images: [img('wedge-for-interchangeable-point')],
    specifications: [
      { label: 'Use', value: 'Removing interchangeable point from female sleeve' },
      { label: 'Model', value: 'MT-3, MT-4, MT-5' },
    ],
    variantAxes: ['Model'],
    variants: rows(['Model'], MT(3, 5).map((m) => [m])),
    source: src25(4, 'Wedge (for Interchangeable Revolving Center)'),
  },
  {
    slug: 'pipe-revolving-centre',
    name: 'Pipe Revolving Centre',
    category: CEN,
    subcategory: 'Revolving Centres',
    brand: BRAND,
    summary: 'Blunt 25–250 · pointed up to 0–5" · MT-2 to MT-6',
    description:
      'Pipe revolving centres in blunt and pointed forms. Capacities run from 25–50 up to 100–250 (blunt) and 0–2" up to 0–5" (pointed); each capacity is listed only for certain Morse tapers between MT-2 and MT-6.',
    images: [img('pipe-revolving-centre'), img('pipe-revolving-centre-2')],
    specifications: [
      { label: 'Forms', value: 'Blunt, pointed' },
      { label: 'Blunt capacities', value: '25–50 to 100–250' },
      { label: 'Pointed capacities', value: '0–2" to 0–5"' },
      { label: 'Morse taper', value: 'MT-2 to MT-6 (depending on capacity)' },
    ],
    variantAxes: ['Capacity (blunt)', 'Capacity (pointed)', 'Model'],
    variants: rows(
      ['Capacity (blunt)', 'Capacity (pointed)', 'Model'],
      [
        ...MT(2, 5).map((m) => ['25–50', '0–2"', m]),
        ...MT(2, 5).map((m) => ['30–65', '0–2.1/2"', m]),
        ...MT(2, 5).map((m) => ['40–75', '0–3"', m]),
        ...MT(3, 5).map((m) => ['50–90', '0–3.1/2"', m]),
        ...MT(3, 6).map((m) => ['65–100', '0–4"', m]),
        ...MT(3, 6).map((m) => ['—', '0–5"', m]),
        ...MT(3, 6).map((m) => ['75–125', '—', m]),
        ...MT(3, 6).map((m) => ['75–150', '—', m]),
        ...MT(4, 6).map((m) => ['100–175', '—', m]),
        ...MT(4, 6).map((m) => ['100–200', '—', m]),
        ...MT(4, 6).map((m) => ['100–250', '—', m]),
      ],
      (a) =>
        `${[a['Capacity (blunt)'], a['Capacity (pointed)']].filter((x) => x !== '—').join(' / ')} · ${a['Model']}`,
    ),
    source: src25(5, 'Pipe Revolving Centers'),
  },
  {
    slug: 'dead-centre-carbide-tipped',
    name: 'Dead Centre',
    category: CEN,
    subcategory: 'Dead Centres',
    brand: BRAND,
    summary: 'MT-1 to MT-7 · plain or carbide tipped · full / half',
    description:
      'Dead centre in full and half forms. Plain versions are listed for MT-1 to MT-7 (full) and MT-1 to MT-6 (half); carbide tipped versions for MT-1 to MT-6 with tip diameters from 7 to 18.',
    images: [img('dead-centre-carbide-tipped')],
    specifications: [
      { label: 'Forms', value: 'Full, half' },
      { label: 'Plain', value: 'Full MT-1 to MT-7 · half MT-1 to MT-6' },
      { label: 'Carbide tipped', value: 'MT-1 to MT-6 (tip dia 7–18)' },
    ],
    variantAxes: ['Model', 'Type', 'Tip dia'],
    variants: rows(
      ['Model', 'Type', 'Tip dia'],
      [
        ...MT(1, 7).map((m) => [m, 'Plain full', '—']),
        ...MT(1, 6).map((m) => [m, 'Plain half', '—']),
        ...[
          ['MT-1', '7'],
          ['MT-2', '9'],
          ['MT-3', '11'],
          ['MT-4', '14'],
          ['MT-5', '18'],
          ['MT-6', '18'],
        ].flatMap(([m, d]) => [
          [m, 'Carbide tipped full', d],
          [m, 'Carbide tipped half', d],
        ]),
      ],
      (a) => `${a['Model']} · ${a['Type']}${a['Tip dia'] !== '—' ? ` · tip ${a['Tip dia']}` : ''}`,
    ),
    source: { doc: 'RR-2026', page: 7, section: 'Dead Center (Carbide Tipped)' },
    otherSources: [src25(6, 'Dead Centers (Plain)')],
  },
  {
    slug: 'cnc-dead-centre-with-draw-off-nut',
    name: 'CNC Dead Centre with Draw Off Nut',
    category: CEN,
    subcategory: 'Dead Centres',
    brand: BRAND,
    summary: 'MT-2 to MT-6 · stub or extended point',
    description:
      'CNC dead centre with draw off nut, listed for MT-2 to MT-6 with stub or extended point, plain or carbide tipped (tip diameter 9 to 18).',
    images: [img('cnc-dead-centre-with-draw-off-nut')],
    specifications: [
      { label: 'Feature', value: 'Draw off nut' },
      { label: 'Point', value: 'Stub or extended · plain or carbide tipped' },
      { label: 'Morse taper', value: 'MT-2 to MT-6' },
    ],
    variantAxes: ['Model', 'Type', 'Tip dia'],
    variants: rows(
      ['Model', 'Type', 'Tip dia'],
      [
        ...MT(2, 6).flatMap((m) => [
          [m, 'Plain stub', '—'],
          [m, 'Plain extended', '—'],
        ]),
        ...[
          ['MT-2', '9'],
          ['MT-3', '11'],
          ['MT-4', '14'],
          ['MT-5', '18'],
          ['MT-6', '18'],
        ].flatMap(([m, d]) => [
          [m, 'Carbide tipped stub', d],
          [m, 'Carbide tipped extended', d],
        ]),
      ],
      (a) => `${a['Model']} · ${a['Type']}${a['Tip dia'] !== '—' ? ` · tip ${a['Tip dia']}` : ''}`,
    ),
    source: { doc: 'RR-2026', page: 7, section: 'CNC Dead Center with Draw Off Nut (Carbide Tipped)' },
    otherSources: [src25(6, 'Dead Centers (Plain) — CNC Dead Center (with draw off nut)')],
  },
  {
    slug: 'special-carbide-tipped-dead-centre',
    name: 'Special Carbide Tipped Dead Centre',
    category: CEN,
    subcategory: 'Dead Centres',
    brand: BRAND,
    summary: 'Tip 12–40 mm · MT-2 to MT-6',
    description:
      'Special carbide tipped dead centre with large tip diameters from 12 mm to 40 mm. Each tip diameter is listed only for certain Morse tapers between MT-2 and MT-6. Dead centres with other special tip diameters are manufactured against order.',
    images: [img('special-carbide-tipped-dead-centre')],
    specifications: [
      { label: 'Point', value: 'Carbide tipped' },
      { label: 'Tip diameters', value: '12, 14, 16, 18, 22, 25, 28, 30, 32, 35, 40 mm' },
      { label: 'Morse taper', value: 'MT-2 to MT-6 (depending on tip diameter)' },
      { label: 'Other tip diameters', value: 'Manufactured against order' },
    ],
    variantAxes: ['Tip diameter', 'Model'],
    variants: rows(
      ['Tip diameter', 'Model'],
      [
        ['12 mm', 'MT-2'],
        ...MT(2, 3).map((m) => ['14 mm', m]),
        ...MT(2, 4).map((m) => ['16 mm', m]),
        ...MT(2, 4).map((m) => ['18 mm', m]),
        ...MT(2, 5).map((m) => ['22 mm', m]),
        ...MT(2, 6).map((m) => ['25 mm', m]),
        ...MT(2, 6).map((m) => ['28 mm', m]),
        ...MT(3, 5).map((m) => ['30 mm', m]),
        ...MT(3, 5).map((m) => ['32 mm', m]),
        ...MT(3, 5).map((m) => ['35 mm', m]),
        ...MT(3, 5).map((m) => ['40 mm', m]),
      ],
    ),
    source: { doc: 'RR-2026', page: 8, section: 'Special Carbide Tipped Dead Center' },
    otherSources: [src25(6, 'Special Carbide Tipped Dead Centers')],
  },
  {
    slug: 'full-carbide-dead-centre',
    name: 'Full Carbide Dead Centre',
    category: CEN,
    subcategory: 'Dead Centres',
    brand: BRAND,
    summary: 'Full 60° carbide tip · MT-2 to MT-5',
    description:
      'Dead centre with the full 60° tip in carbide, listed for MT-2 to MT-5 with carbide diameters of 18.0, 24.1, 31.6 and 44.7 mm.',
    images: [img('full-carbide-dead-centre')],
    specifications: [
      { label: 'Tip', value: 'Full 60° tip in carbide' },
      { label: 'Morse taper', value: 'MT-2, MT-3, MT-4, MT-5' },
    ],
    variantAxes: ['Model', 'Carbide diameter'],
    variants: rows(
      ['Model', 'Carbide diameter'],
      [
        ['MT-2', '18.0 mm'],
        ['MT-3', '24.1 mm'],
        ['MT-4', '31.6 mm'],
        ['MT-5', '44.7 mm'],
      ],
    ),
    source: { doc: 'RR-2026', page: 8, section: 'Full Carbide Dead Center (with full 60 deg tip as carbide)' },
    featured: true,
  },
];
