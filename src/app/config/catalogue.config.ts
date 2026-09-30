/** Catalogue browsing constants. */

/** Client requirement: exactly 12 product cards per catalogue page. */
export const PRODUCTS_PER_PAGE = 12;

export type SortKey = 'catalogue' | 'name-asc' | 'name-desc' | 'category';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'catalogue', label: 'Catalogue order' },
  { key: 'name-asc', label: 'Product Name A–Z' },
  { key: 'name-desc', label: 'Product Name Z–A' },
  { key: 'category', label: 'Category' },
];

/** Search input debounce before the URL (and results) update. */
export const SEARCH_DEBOUNCE_MS = 220;
