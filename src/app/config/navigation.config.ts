/**
 * Primary navigation. The client specified EXACTLY these items, in this order:
 *   Products · Categories · About Us · Ph. No. · Get A Quote
 * The phone item and the quote CTA are rendered specially by the header,
 * so only the three page links live here.
 */
export interface NavLink {
  label: string;
  path: string;
  /** Match child routes too (e.g. /products/:slug keeps "Products" active). */
  exact: boolean;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: 'Products', path: '/products', exact: false },
  { label: 'Categories', path: '/categories', exact: false },
  { label: 'About Us', path: '/about-us', exact: true },
];

export const QUOTE_PATH = '/get-a-quote';
export const CONTACT_PATH = '/contact';
