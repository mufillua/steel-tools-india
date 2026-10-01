import { Product } from '../../models/product.model';
import { MIRANDA_PRODUCTS } from './miranda';
import { RR_2025_PRODUCTS } from './rr-2025';
import { RR_2026_PRODUCTS } from './rr-2026';
import { RR_CENTRE_PRODUCTS } from './rr-centres';
import { RR_CT_PRODUCTS } from './rr-ct';
import { RR_HT_PRODUCTS } from './rr-ht';
import { LIFTING_PRODUCTS } from './lifting';
import { TAPARIA_PRODUCTS } from './taparia';

/**
 * Full catalogue. Loaded lazily by ProductService (dynamic import) so it never sits in the initial bundle.
 * Order here = "catalogue order" on the Products page.
 */
export const ALL_PRODUCTS: Product[] = [
  ...RR_2026_PRODUCTS.filter((p) => p.category === 'machine-tool-accessories'),
  ...RR_2025_PRODUCTS,
  ...RR_CENTRE_PRODUCTS,
  ...RR_2026_PRODUCTS.filter((p) => p.category !== 'machine-tool-accessories'),
  ...RR_HT_PRODUCTS,
  ...RR_CT_PRODUCTS,
  ...MIRANDA_PRODUCTS,
  ...TAPARIA_PRODUCTS,
  ...LIFTING_PRODUCTS,
];
