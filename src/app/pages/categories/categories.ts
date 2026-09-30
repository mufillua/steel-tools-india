import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryIcon } from '../../components/category-icon/category-icon';
import { Icon } from '../../components/icon/icon';
import { PageIntro } from '../../components/page-intro/page-intro';
import { ProductImage } from '../../components/product-image/product-image';
import { QUOTE_PATH } from '../../config/navigation.config';
import { CategoryWithCount } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

/** Types shown before "+ N more". */
const TYPE_LIMIT = 8;

interface CategoryView {
  category: CategoryWithCount;
  ref: string;
  types: { name: string; count: number }[];
  moreTypes: number;
  photos: Product[];
  sizes: number;
}

/**
 * /categories — every catalogue category with its icon, photos, product types and counts.
 * Everything is derived from the product data; clicking goes to /products?category=… (and &type=…).
 */
@Component({
  selector: 'sti-categories',
  imports: [PageIntro, RouterLink, CategoryIcon, Icon, ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  protected readonly catalogue = inject(ProductService);
  protected readonly quotePath = QUOTE_PATH;
  protected readonly crumbs = [{ label: 'Home', link: '/' }, { label: 'Categories' }];
  protected readonly ready = computed(() => this.catalogue.status() === 'ready');

  protected readonly views = computed<CategoryView[]>(() => {
    const products = this.catalogue.products();
    return this.catalogue.categories().map((category, i) => {
      const list = products.filter((p) => p.category === category.slug);
      const typeCounts = new Map<string, number>();
      for (const p of list) typeCounts.set(p.subcategory, (typeCounts.get(p.subcategory) ?? 0) + 1);
      const types = [...typeCounts].map(([name, count]) => ({ name, count }));
      const withPhoto = list.filter((p) => p.images.length);
      const photos = [...withPhoto.filter((p) => p.featured), ...withPhoto.filter((p) => !p.featured)]
        // one photo per product type, so the strip shows variety
        .filter((p, idx, arr) => arr.findIndex((x) => x.subcategory === p.subcategory) === idx)
        .slice(0, 3);
      return {
        category,
        ref: (i + 1).toString().padStart(2, '0'),
        types: types.slice(0, TYPE_LIMIT),
        moreTypes: Math.max(types.length - TYPE_LIMIT, 0),
        photos,
        sizes: list.reduce((n, p) => n + p.variants.length, 0),
      };
    });
  });

  protected readonly totals = computed(() => ({
    products: this.catalogue.products().length,
    types: new Set(this.catalogue.products().map((p) => `${p.category}/${p.subcategory}`)).size,
  }));

  private readonly document = inject(DOCUMENT);

  constructor() {
    this.catalogue.load();
  }

  protected jumpTo(event: Event, slug: string): void {
    event.preventDefault();
    const el = this.document.getElementById(`cat-${slug}`);
    if (!el) return;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.querySelector<HTMLElement>('h2 a')?.focus({ preventScroll: true });
  }
}
