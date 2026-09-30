import { Product } from '../../models/product.model';
import { rows } from '../variant-builders';

/**
 * R★R Brand — Hand Tools & Letter / Figure Punchings (Marking Steel Stamps), list w.e.f. 01-06-2026 (16 pp).
 * Client asked for PAGE 3 ONLY: Marking Letter & Figure Punches, Dotted Punches, Reverse Sets.
 * Read visually from a 300-dpi render. Rates and surcharge notes intentionally omitted.
 */

const BRAND = 'R★R Brand';
const HT = 'industrial-hand-tools';
const SUB = 'Letter & Figure Punches';
const img = (file: string) => `assets/products/${HT}/${file}.webp`;

const FIG = 'Figures 0–8 · 9 pcs';
const LET = 'Letters A–Z & · 27 pcs';
const AXES = ['Character size', 'Size (mm)', 'Set'];

/** Every size is listed for both a figure set and a letter set. */
const sets = (sizes: [string, string][]) =>
  rows(
    AXES,
    sizes.flatMap(([inch, mm]) => [
      [inch, mm, FIG],
      [inch, mm, LET],
    ]),
    (a) => `${a['Character size']}${a['Size (mm)'] !== '—' ? ` (${a['Size (mm)']} mm)` : ''} · ${a['Set'].startsWith('Fig') ? 'Figure set' : 'Letter set'}`,
  );

export const RR_HT_PRODUCTS: Product[] = [
  {
    slug: 'marking-letter-figure-punches',
    name: 'Marking Letter & Figure Punches',
    category: HT,
    subcategory: SUB,
    brand: BRAND,
    summary: '1/32" to 1" (1–25 mm) · figure & letter sets',
    description:
      'Marking steel stamps for punching numbers and letters. Listed as figure sets (0–8, 9 pieces) and letter sets (A–Z and &, 27 pieces) in 16 character sizes from 1/32" (1 mm) to 1" (25 mm). Made from high grade alloy steel, duly hardened and tempered.',
    images: [img('letter-figure-punch-set')],
    specifications: [
      { label: 'Material', value: 'High grade alloy steel' },
      { label: 'Treatment', value: 'Duly hardened & tempered' },
      { label: 'Figure set', value: '0–8 · 9 pcs' },
      { label: 'Letter set', value: 'A–Z & · 27 pcs' },
      { label: 'Character sizes', value: '1/32" to 1" (1 mm to 25 mm)' },
      { label: 'Guarantee', value: 'Against any manufacturing defects' },
    ],
    variantAxes: AXES,
    variants: sets([
      ['1/32"', '1'],
      ['1/16"', '1.5'],
      ['5/64"', '2'],
      ['3/32"', '2.5'],
      ['1/8"', '3'],
      ['5/32"', '4'],
      ['3/16"', '5'],
      ['1/4"', '6'],
      ['9/32"', '7'],
      ['5/16"', '8'],
      ['11/32"', '9'],
      ['3/8"', '10'],
      ['1/2"', '12'],
      ['5/8"', '15'],
      ['3/4"', '19'],
      ['1"', '25'],
    ]),
    source: { doc: 'RR-HT', page: 3, section: 'Marking Letter & Figure Punches' },
  },
  {
    slug: 'dotted-letter-figure-punches',
    name: 'Dotted Letter & Figure Punches',
    category: HT,
    subcategory: SUB,
    brand: BRAND,
    summary: '3/32" to 1/2" (2.5–12 mm) · bright chrome finish',
    description:
      'Dotted marking punches, listed as figure sets (0–8, 9 pieces) and letter sets (A–Z and &, 27 pieces) in 8 character sizes from 3/32" (2.5 mm) to 1/2" (12 mm). Made from high grade alloy steel, duly hardened and tempered, with a bright chrome finish.',
    images: [img('dotted-punch-set')],
    specifications: [
      { label: 'Material', value: 'High grade alloy steel' },
      { label: 'Treatment', value: 'Duly hardened & tempered' },
      { label: 'Finish', value: 'Bright chrome (also available in auto black & satin finish)' },
      { label: 'Figure set', value: '0–8 · 9 pcs' },
      { label: 'Letter set', value: 'A–Z & · 27 pcs' },
      { label: 'Character sizes', value: '3/32" to 1/2" (2.5 mm to 12 mm)' },
      { label: 'Loose pieces', value: 'Minimum order 27 pcs' },
    ],
    variantAxes: AXES,
    variants: sets([
      ['3/32"', '2.5'],
      ['1/8"', '3'],
      ['5/32"', '4'],
      ['3/16"', '5'],
      ['1/4"', '6'],
      ['5/16"', '8'],
      ['3/8"', '10'],
      ['1/2"', '12'],
    ]),
    source: { doc: 'RR-HT', page: 3, section: 'Dotted Punches' },
  },
  {
    slug: 'reverse-letter-figure-punch-sets',
    name: 'Reverse Letter & Figure Punch Sets',
    category: HT,
    subcategory: SUB,
    brand: BRAND,
    summary: '3/32" to 1/4" · figure & letter sets',
    description:
      'Reverse punch sets, listed as figure sets (9 pieces) and letter sets (27 pieces) in five sizes from 3/32" to 1/4".',
    images: [img('reverse-punch-set')],
    specifications: [
      { label: 'Figure set', value: '9 pcs' },
      { label: 'Letter set', value: '27 pcs' },
      { label: 'Sizes', value: '3/32", 1/8", 5/32", 3/16", 1/4"' },
    ],
    variantAxes: AXES,
    variants: sets([
      ['3/32"', '2.5'],
      ['1/8"', '3.0'],
      // Printed as 5.0 mm — the same as 3/16". Left blank until confirmed (probably 4.0 mm).
      ['5/32"', '—'],
      ['3/16"', '5.0'],
      ['1/4"', '6.0'],
    ]),
    source: { doc: 'RR-HT', page: 3, section: 'Reverse Sets' },
    reviewNote: 'Reverse Sets: 5/32" is printed as 5.0 mm (same as 3/16"); mm left blank pending confirmation.',
  },
];
