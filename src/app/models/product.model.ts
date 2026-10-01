/**
 * Product model.
 *
 * Deliberately carries NO price fields — the client asked for prices never to appear on the site.
 * Every value here must come from the supplied catalogue documents; unknown = omitted, never guessed.
 */

export type SourceDoc = 'RR-2025' | 'RR-2026' | 'RR-CT' | 'RR-HT' | 'MIRANDA' | 'TAPARIA' | 'LIFTING';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductVariant {
  /** Stable, URL-safe id (used for ?variant= preselection and enquiry text). */
  id: string;
  /** Human label, e.g. "ER-32 · 100L". */
  label: string;
  /** Attribute values keyed by the product's variantAxes, e.g. { Collet: 'ER-32', Length: '100L' }. */
  attributes: Record<string, string>;
}

export interface ProductSource {
  doc: SourceDoc;
  /** Page number in the source document. */
  page: number;
  /** Section heading as printed. */
  section: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Category slug — see data/categories.ts */
  category: string;
  subcategory: string;
  /** Manufacturer brand. Empty ('') when the brand must not be shown (lifting range, by client request); the UI hides it. */
  brand: string;
  /** Standard(s) printed with the product heading, e.g. "DIN 6499". */
  standard?: string;
  /** One-line specification shown on product cards. */
  summary: string;
  /** Short factual description built only from what the source table shows. */
  description: string;
  /** Image paths under /assets/products/…; empty = category placeholder is shown. */
  images: string[];
  specifications: ProductSpec[];
  /** Column names for the variant table, in display order. */
  variantAxes: string[];
  variants: ProductVariant[];
  source: ProductSource;
  /** Further supplied documents this product also draws on (e.g. plain variants from the 2025 master list). */
  otherSources?: ProductSource[];
  featured?: boolean;
  /** Set when something in the source could not be read with certainty. Shown to no one; tracked in docs. */
  reviewNote?: string;
}
