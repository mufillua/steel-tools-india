import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Breadcrumbs, Crumb } from '../../components/breadcrumbs/breadcrumbs';
import { EmailButton, WhatsappButton } from '../../components/enquiry-buttons/enquiry-buttons';
import { EnquiryPanel } from '../../components/enquiry-panel/enquiry-panel';
import { Icon } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductGallery } from '../../components/product-gallery/product-gallery';
import { VariantSelector } from '../../components/variant-selector/variant-selector';
import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';
import { Product, SourceDoc } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

/** Public names for the supplied catalogues (the word "price" is deliberately not used). */
const SOURCE_NAMES: Record<SourceDoc, string> = {
  'RR-2025': 'R★R Brand machine tools accessories catalogue',
  'RR-2026': 'R★R Brand supplementary catalogue',
  'RR-CT': 'R★R Brand carbide cutting tools catalogue',
  'RR-HT': 'R★R Brand hand tools & punches catalogue',
  MIRANDA: 'Miranda products catalogue',
  TAPARIA: 'Taparia Tools catalogue (April 2026)',
};

/**
 * /products/:slug — product page.
 * The selected size lives in the URL (?variant=<id>), so a link to a specific size can be shared
 * and the WhatsApp / email enquiry always carries exactly what is on screen.
 */
@Component({
  selector: 'sti-product-detail',
  imports: [RouterLink, Breadcrumbs, Icon, ProductGallery, EnquiryPanel, VariantSelector, ProductCard, WhatsappButton, EmailButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  /** Route param. */
  readonly slug = input.required<string>();
  /** Query param ?variant= */
  readonly variant = input<string | undefined>();

  protected readonly catalogue = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly quotePath = QUOTE_PATH;

  protected readonly product = computed(() => this.catalogue.getProductBySlug(this.slug()));
  protected readonly category = computed(() => {
    const p = this.product();
    return p ? this.catalogue.getCategory(p.category) : undefined;
  });

  /**
   * ?variant= is applied only once the page is live in the browser. The prerendered HTML has no size
   * selected, so the first client render must match it for hydration; the selection follows a frame later.
   */
  private readonly live = signal(false);

  /** Selected size: from ?variant=, or the only size when there is just one. Unknown ids are ignored. */
  protected readonly selected = computed(() => {
    const p = this.product();
    if (!p) return null;
    const id = this.live() ? this.variant() : undefined;
    return p.variants.find((v) => v.id === id) ?? (p.variants.length === 1 ? p.variants[0] : null);
  });

  protected readonly crumbs = computed<Crumb[]>(() => {
    const p = this.product();
    const c = this.category();
    const trail: Crumb[] = [
      { label: 'Home', link: '/' },
      { label: 'Products', link: '/products' },
    ];
    if (c) trail.push({ label: c.name, link: '/products', queryParams: { category: c.slug } });
    trail.push({ label: p?.name ?? 'Product not found' });
    return trail;
  });

  protected readonly details = computed(() => {
    const p = this.product();
    if (!p) return [];
    const rows = [
      { label: 'Brand', value: p.brand },
      { label: 'Category', value: this.category()?.name ?? '' },
      { label: 'Type', value: p.subcategory },
    ];
    if (p.standard) rows.push({ label: 'Standard', value: p.standard });
    if (p.variants.length) rows.push({ label: 'Sizes listed', value: String(p.variants.length) });
    // rows.push({ label: 'Listed in', value: `${SOURCE_NAMES[p.source.doc]}, p. ${p.source.page}` });
    return rows.filter((r) => r.value);
  });

  /** Same type first, then the rest of the category. */
  protected readonly related = computed<Product[]>(() => {
    const p = this.product();
    if (!p) return [];
    const others = this.catalogue.products().filter((x) => x.slug !== p.slug && x.category === p.category);
    const withPhoto = (a: Product, b: Product) => Number(!!b.images.length) - Number(!!a.images.length);
    const sameType = others.filter((x) => x.subcategory === p.subcategory).sort(withPhoto);
    const rest = others.filter((x) => x.subcategory !== p.subcategory).sort(withPhoto);
    return [...sameType, ...rest].slice(0, 4);
  });

  protected readonly quoteParams = computed(() => {
    const p = this.product();
    const v = this.selected();
    return p ? { product: p.slug, ...(v ? { variant: v.id } : {}) } : {};
  });


  // ── Sticky enquiry dock: shown while the main enquiry panel is off screen ──
  private readonly panelEl = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly endEl = viewChild<ElementRef<HTMLElement>>('pageEnd');
  private readonly panelInView = signal(true);
  private readonly endInView = signal(false);
  protected readonly dockVisible = computed(() => !this.panelInView() && !this.endInView());

  constructor() {
    this.catalogue.load();
    afterNextRender(() => this.live.set(true));

    effect((onCleanup) => {
      const panel = this.panelEl()?.nativeElement;
      const end = this.endEl()?.nativeElement;
      if (!panel || !end || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.target === panel) this.panelInView.set(e.isIntersecting);
          if (e.target === end) this.endInView.set(e.isIntersecting);
        }
      });
      io.observe(panel);
      io.observe(end);
      onCleanup(() => io.disconnect());
    });
  }

  protected toSizes(event: Event, el: HTMLElement): void {
    event.preventDefault();
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
  }

  protected selectVariant(id: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { variant: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
