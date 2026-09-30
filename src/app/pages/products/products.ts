import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';

import {
  PRODUCTS_PER_PAGE,
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
  SortKey,
} from '../../config/catalogue.config';
import { COMPANY } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';
import { EmptyState } from '../../components/empty-state/empty-state';
import { Icon } from '../../components/icon/icon';
import { Pagination } from '../../components/pagination/pagination';
import { Breadcrumbs, Crumb } from '../../components/breadcrumbs/breadcrumbs';
import { ProductCard } from '../../components/product-card/product-card';
import {
  FilterGroup,
  FilterKind,
  FilterOption,
  ProductFilters,
} from '../../components/product-filters/product-filters';
import { ProductGridSkeleton } from '../../components/product-grid-skeleton/product-grid-skeleton';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

const LIST_SEP = ',';
const split = (v: string | null): string[] => (v ? v.split(LIST_SEP).filter(Boolean) : []);
const join = (a: string[]): string | null => (a.length ? a.join(LIST_SEP) : null);
const toggleIn = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

/**
 * Catalogue page. The URL query string is the single source of truth:
 *   ?q=&category=a,b&type=x,y&brand=&sort=&page=
 * so filters survive refresh, are shareable, and Back/Forward work.
 *
 * Pipeline: load → search → filter → sort → total → paginate (12) → display.
 */
@Component({
  selector: 'sti-products',
  imports: [RouterLink, Breadcrumbs, Icon, ProductCard, ProductFilters, Pagination, EmptyState, ProductGridSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrl: './products.scss',
  // Output depends on the query string (?q, ?category, ?page…), which prerendering can't know,
  // so this page renders fresh in the browser instead of hydrating the prerendered list.
  host: { '(document:keydown.escape)': 'closeDrawer()', ngSkipHydration: 'true' },
})
export class Products {
  private readonly catalogue = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  protected readonly perPage = PRODUCTS_PER_PAGE;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly status = this.catalogue.status;

  private readonly resultsTop = viewChild<ElementRef<HTMLElement>>('resultsTop');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // ── URL state ────────────────────────────────────────────
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly query = computed(() => (this.params().get('q') ?? '').trim());
  protected readonly selCategories = computed(() => split(this.params().get('category')));
  protected readonly selTypes = computed(() => split(this.params().get('type')));
  protected readonly selBrands = computed(() => split(this.params().get('brand')));
  protected readonly sort = computed<SortKey>(() => {
    const s = this.params().get('sort') as SortKey | null;
    return SORT_OPTIONS.some((o) => o.key === s) ? (s as SortKey) : 'catalogue';
  });
  private readonly requestedPage = computed(() => {
    const n = parseInt(this.params().get('page') ?? '1', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  });

  /** What the user is typing (debounced into ?q=). */
  protected readonly searchText = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly drawerOpen = signal(false);

  // ── Pipeline ─────────────────────────────────────────────
  private readonly searched = computed(() => this.catalogue.searchProducts(this.query()));

  private readonly filtered = computed(() =>
    this.catalogue.filterProducts(
      { categories: this.selCategories(), subcategories: this.selTypes(), brands: this.selBrands() },
      this.searched(),
    ),
  );

  private readonly sorted = computed(() => {
    const list = [...this.filtered()];
    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'en', { numeric: true });
    switch (this.sort()) {
      case 'name-asc':
        return list.sort(byName);
      case 'name-desc':
        return list.sort((a, b) => byName(b, a));
      case 'category': {
        const order = this.catalogue.categories().map((c) => c.slug);
        return list.sort(
          (a, b) => order.indexOf(a.category) - order.indexOf(b.category) || byName(a, b),
        );
      }
      default: {
        // No search: catalogue order as listed in the source documents.
        // With a search: best match first (stable, so ties keep catalogue order).
        const q = this.query();
        if (!q) return list;
        const score = new Map(list.map((p) => [p.slug, this.catalogue.relevance(p, q)]));
        return list.sort((a, b) => score.get(b.slug)! - score.get(a.slug)!);
      }
    }
  });

  protected readonly total = computed(() => this.sorted().length);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PRODUCTS_PER_PAGE)));
  protected readonly page = computed(() => Math.min(this.requestedPage(), this.totalPages()));
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * PRODUCTS_PER_PAGE;
    return this.sorted().slice(start, start + PRODUCTS_PER_PAGE);
  });
  protected readonly rangeStart = computed(() =>
    this.total() ? (this.page() - 1) * PRODUCTS_PER_PAGE + 1 : 0,
  );
  protected readonly rangeEnd = computed(() => Math.min(this.page() * PRODUCTS_PER_PAGE, this.total()));

  // ── Facets (counts = results you would get) ──────────────
  protected readonly categoryOptions = computed<FilterOption[]>(() => {
    const pool = this.catalogue.filterProducts({ brands: this.selBrands() }, this.searched());
    return this.catalogue.categories().map((c) => ({
      value: c.slug,
      label: c.name,
      count: pool.filter((p) => p.category === c.slug).length,
      checked: this.selCategories().includes(c.slug),
    }));
  });

  protected readonly typeGroups = computed<FilterGroup[]>(() => {
    const all = this.catalogue.products();
    const pool = this.catalogue.filterProducts({ brands: this.selBrands() }, this.searched());
    return this.selCategories().map((slug) => {
      const subs = [...new Set(all.filter((p) => p.category === slug).map((p) => p.subcategory))];
      return {
        title: this.catalogue.categoryName(slug),
        options: subs.map((s) => ({
          value: s,
          label: s,
          count: pool.filter((p) => p.category === slug && p.subcategory === s).length,
          checked: this.selTypes().includes(s),
        })),
      };
    });
  });

  protected readonly brandOptions = computed<FilterOption[]>(() => {
    const pool = this.catalogue.filterProducts(
      { categories: this.selCategories(), subcategories: this.selTypes() },
      this.searched(),
    );
    return this.catalogue.brands().map((b) => ({
      value: b,
      label: b,
      count: pool.filter((p) => p.brand === b).length,
      checked: this.selBrands().includes(b),
    }));
  });

  protected readonly activeFilterCount = computed(
    () => this.selCategories().length + this.selTypes().length + this.selBrands().length,
  );

  protected readonly chips = computed(() => [
    ...this.selCategories().map((v) => ({ kind: 'category' as FilterKind, value: v, label: this.catalogue.categoryName(v) })),
    ...this.selTypes().map((v) => ({ kind: 'type' as FilterKind, value: v, label: v })),
    ...this.selBrands().map((v) => ({ kind: 'brand' as FilterKind, value: v, label: v })),
  ]);

  /** Single-category view gets that category's name and description in the header. */
  protected readonly focusCategory = computed(() =>
    this.selCategories().length === 1 ? this.catalogue.getCategory(this.selCategories()[0]) : undefined,
  );

  protected readonly crumbs = computed<Crumb[]>(() => {
    const c = this.focusCategory();
    return c
      ? [{ label: 'Home', link: '/' }, { label: 'Products', link: '/products' }, { label: c.name }]
      : [{ label: 'Home', link: '/' }, { label: 'Products' }];
  });

  constructor() {
    this.catalogue.load();

    // Keep the search box in step with ?q= (e.g. Back button, links from elsewhere).
    // Skipped while the visitor is typing, so a pending URL update never overwrites keystrokes.
    effect(() => {
      const q = this.query();
      untracked(() => {
        const typing = this.document.activeElement === this.searchInput()?.nativeElement;
        if (!typing && q !== this.searchText().trim()) this.searchText.set(q);
      });
    });

    // Page title reflects a single selected category.
    effect(() => {
      const c = this.focusCategory();
      this.title.setTitle(`${c ? `${c.name} — Products` : 'Products'} | ${COMPANY.name}`);
    });

    // Lock background scroll while the mobile filter drawer is open.
    effect(() => this.document.body.classList.toggle('sti-scroll-locked', this.drawerOpen()));
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.searchTimer);
      this.document.body.classList.remove('sti-scroll-locked');
    });
  }

  // ── Actions ──────────────────────────────────────────────
  private update(changes: Params, opts: { resetPage?: boolean; replace?: boolean } = {}): void {
    const { resetPage = true, replace = true } = opts;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...changes, ...(resetPage ? { page: null } : {}) },
      queryParamsHandling: 'merge',
      replaceUrl: replace,
    });
  }

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.update({ q: value.trim() || null }), SEARCH_DEBOUNCE_MS);
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();
    clearTimeout(this.searchTimer);
    this.update({ q: this.searchText().trim() || null });
  }

  protected clearSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchText.set('');
    this.update({ q: null });
  }

  protected onToggle(e: { kind: FilterKind; value: string }): void {
    if (e.kind === 'category') {
      const cats = toggleIn(this.selCategories(), e.value);
      // Dropping a category also drops its product-type selections.
      const removing = !cats.includes(e.value);
      const types = removing
        ? this.selTypes().filter(
            (t) => !this.catalogue.products().some((p) => p.category === e.value && p.subcategory === t),
          )
        : this.selTypes();
      this.update({ category: join(cats), type: join(types) });
    } else if (e.kind === 'type') {
      this.update({ type: join(toggleIn(this.selTypes(), e.value)) });
    } else {
      this.update({ brand: join(toggleIn(this.selBrands(), e.value)) });
    }
  }

  protected clearFilters(): void {
    this.update({ category: null, type: null, brand: null });
  }

  protected clearEverything(): void {
    clearTimeout(this.searchTimer);
    this.searchText.set('');
    this.update({ q: null, category: null, type: null, brand: null, sort: null });
  }

  protected onSort(value: string): void {
    this.update({ sort: value === 'catalogue' ? null : value });
  }

  protected goToPage(n: number): void {
    // Page changes are real history entries so Back returns to the previous page.
    this.update({ page: n > 1 ? n : null }, { resetPage: false, replace: false });
    const el = this.resultsTop()?.nativeElement;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  protected openDrawer(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
