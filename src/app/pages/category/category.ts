import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../components/icon/icon';
import { PageIntro } from '../../components/page-intro/page-intro';
import { ProductCard } from '../../components/product-card/product-card';
import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { categoryHeading } from './category.resolvers';

/** How many product cards the landing page shows before the full, grouped list of links. */
const CARD_LIMIT = 8;

/**
 * /categories/:slug — a prerendered landing page per category, so each product group has its own
 * indexable URL, heading and description (searches like "chain pulley block Kolkata").
 * Every product in the category is linked from the grouped list; the filterable view stays at /products?category=…
 */
@Component({
  selector: 'sti-category-page',
  imports: [PageIntro, ProductCard, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class CategoryPage {
  private readonly catalogue = inject(ProductService);

  /** Route param (component input binding). */
  readonly slug = input.required<string>();

  protected readonly company = COMPANY;
  protected readonly quotePath = QUOTE_PATH;

  protected readonly category = computed(() => this.catalogue.getCategory(this.slug()) ?? null);
  protected readonly products = computed(() => this.catalogue.getProductsByCategory(this.slug()));
  protected readonly sizes = computed(() => this.products().reduce((n, p) => n + p.variants.length, 0));

  /** Featured and photographed products first, one per type where possible. */
  protected readonly highlights = computed<Product[]>(() => {
    const list = this.products();
    const ranked = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured && p.images.length), ...list];
    const picked: Product[] = [];
    const types = new Set<string>();
    for (const p of ranked) if (!picked.includes(p) && !types.has(p.subcategory)) { picked.push(p); types.add(p.subcategory); }
    for (const p of ranked) if (picked.length < CARD_LIMIT && !picked.includes(p)) picked.push(p);
    return picked.slice(0, CARD_LIMIT);
  });

  /** Every product grouped by type, in catalogue order. */
  protected readonly groups = computed(() => {
    const map = new Map<string, Product[]>();
    for (const p of this.products()) map.set(p.subcategory, [...(map.get(p.subcategory) ?? []), p]);
    return [...map.entries()].map(([name, items]) => ({ name, items }));
  });

  protected readonly others = computed(() => this.catalogue.categories().filter((c) => c.slug !== this.slug()));

  protected readonly crumbs = computed(() => [
    { label: 'Home', link: '/' },
    { label: 'Categories', link: '/categories' },
    { label: this.category()?.name ?? 'Not found' },
  ]);

  /** H1: the searched-for heading (e.g. "Chain Pulley Blocks, Electric Hoists & Spring Balancers"). */
  protected readonly heading = computed(() => {
    const c = this.category();
    return c ? categoryHeading(c) : '';
  });

  /** The street part of the address ("N. S. Road"), whatever order the address line is written in. */
  private readonly street =
    COMPANY.address.lines[0].split(', ').find((part) => /road|street|sarani|lane|avenue/i.test(part)) ?? COMPANY.address.lines[0];

  protected readonly lead = computed(() => {
    const c = this.category();
    return c ? `${c.description} Supplied from ${this.street}, ${COMPANY.city} — enquire on WhatsApp or email.` : '';
  });

  protected readonly whatsapp = computed(() => {
    const c = this.category();
    const text = `Hello ${COMPANY.name}, I'm looking for ${c?.name ?? 'tools'}. Please share details and availability.`;
    return `${COMPANY_LINKS.whatsapp}?text=${encodeURIComponent(text)}`;
  });

  constructor() {
    this.catalogue.load();
  }
}
