import { Injectable, PendingTasks, computed, inject, signal } from '@angular/core';

import { CATEGORIES } from '../data/categories';
import { CategoryWithCount } from '../models/category.model';
import { Product } from '../models/product.model';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ProductFilter {
  categories?: string[];
  subcategories?: string[];
  brands?: string[];
}

/** Lower-cased haystack per product, built once — keeps search cheap on every keystroke. */
function buildSearchText(p: Product): string {
  return [
    p.name,
    p.category,
    CATEGORIES.find((c) => c.slug === p.category)?.name ?? '',
    p.subcategory,
    p.brand,
    p.standard ?? '',
    p.summary,
    p.description,
    ...p.specifications.map((s) => `${s.label} ${s.value}`),
    ...p.variants.map((v) => v.label),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/[×x]/g, 'x');
}

const normalise = (q: string) => q.toLowerCase().replace(/[×]/g, 'x').trim();

/**
 * The only way the UI touches catalogue data.
 * Data is dynamically imported on first use, so page components get a real loading state.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Product[]>([]);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly searchIndex = new Map<string, string>();
  private loading?: Promise<void>;
  /** Keeps prerendering (and hydration) waiting until the catalogue has arrived. */
  private readonly pendingTasks = inject(PendingTasks);

  readonly status = this._status.asReadonly();
  readonly products = this._products.asReadonly();

  readonly categories = computed<CategoryWithCount[]>(() => {
    const counts = new Map<string, number>();
    for (const p of this._products()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return CATEGORIES.map((c) => ({ ...c, productCount: counts.get(c.slug) ?? 0 }));
  });

  readonly featured = computed(() => this._products().filter((p) => p.featured));

  readonly brands = computed(() => [...new Set(this._products().map((p) => p.brand).filter(Boolean))].sort());

  /** Total listed sizes / variants across the catalogue (same figure everywhere on the site). */
  readonly variantCount = computed(() => this._products().reduce((n, p) => n + p.variants.length, 0));

  /** Idempotent — safe to call from every page. */
  load(): Promise<void> {
    if (this.loading) return this.loading;
    this._status.set('loading');
    const done = this.pendingTasks.add();
    this.loading = import('../data/products')
      .then(({ ALL_PRODUCTS }) => {
        for (const p of ALL_PRODUCTS) this.searchIndex.set(p.slug, buildSearchText(p));
        this._products.set(ALL_PRODUCTS);
        this._status.set('ready');
      })
      .catch((err) => {
        console.error('Catalogue failed to load', err);
        this._status.set('error');
        this.loading = undefined;
      })
      .finally(done);
    return this.loading;
  }

  getProducts(): Product[] {
    return this._products();
  }

  getProductBySlug(slug: string): Product | undefined {
    return this._products().find((p) => p.slug === slug);
  }

  getProductsByCategory(categorySlug: string): Product[] {
    return this._products().filter((p) => p.category === categorySlug);
  }

  getCategories(): CategoryWithCount[] {
    return this.categories();
  }

  getCategory(slug: string): CategoryWithCount | undefined {
    return this.categories().find((c) => c.slug === slug);
  }

  getFeaturedProducts(limit = 8): Product[] {
    return this.featured().slice(0, limit);
  }

  /** Every whitespace-separated term must appear somewhere in the product's searchable text. */
  searchProducts(query: string, list: Product[] = this._products()): Product[] {
    const terms = normalise(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return list;
    return list.filter((p) => {
      const text = this.searchIndex.get(p.slug) ?? '';
      return terms.every((t) => text.includes(t));
    });
  }

  /**
   * Relevance of a product for a query (higher = better). Name hits outweigh
   * size/variant hits, which outweigh description/category hits.
   */
  relevance(p: Product, query: string): number {
    const q = normalise(query);
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;
    const name = normalise(p.name);
    const variants = p.variants.map((v) => normalise(v.label)).join(' ');
    const specs = p.specifications.map((s) => normalise(s.value)).join(' ');
    let score = name.includes(q) ? 20 : 0;
    for (const t of terms) {
      if (new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(name)) score += 8;
      else if (name.includes(t)) score += 4;
      if (variants.includes(t)) score += 3;
      if (specs.includes(t)) score += 1;
    }
    return score;
  }

  filterProducts(filter: ProductFilter, list: Product[] = this._products()): Product[] {
    const { categories, subcategories, brands } = filter;
    return list.filter(
      (p) =>
        (!categories?.length || categories.includes(p.category)) &&
        (!subcategories?.length || subcategories.includes(p.subcategory)) &&
        (!brands?.length || brands.includes(p.brand)),
    );
  }

  categoryName(slug: string): string {
    return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  }
}
