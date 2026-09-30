import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';

import { Product, ProductVariant } from '../../models/product.model';
import { Icon } from '../icon/icon';

/** Rows shown before "Show all sizes". */
const ROW_LIMIT = 20;
/** A single-axis product with up to this many sizes is shown as chips instead of a table. */
const CHIP_MAX = 16;

const norm = (s: string) => s.toLowerCase().replace(/[×]/g, 'x').replace(/[ø\s]/g, '');

interface AxisFilter {
  axis: string;
  values: { value: string; count: number }[];
}

/**
 * Size / variant chooser. Values come straight from the product's variant table.
 * - one axis, few sizes  → chip radio group
 * - otherwise            → table (radio per row) with optional axis chips + "Find a size"
 * The parent owns the selection (it lives in the URL as ?variant=).
 */
@Component({
  selector: 'sti-variant-selector',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './variant-selector.html',
  styleUrl: './variant-selector.scss',
})
export class VariantSelector {
  readonly product = input.required<Product>();
  readonly selectedId = input<string | null>(null);
  readonly selectedChange = output<string | null>();

  protected readonly axes = computed(() => this.product().variantAxes);
  protected readonly variants = computed(() => this.product().variants);
  protected readonly mode = computed<'chips' | 'table'>(() =>
    this.axes().length === 1 && this.variants().length <= CHIP_MAX ? 'chips' : 'table',
  );
  protected readonly selected = computed(
    () => this.variants().find((v) => v.id === this.selectedId()) ?? null,
  );

  // Local UI state — reset whenever the product changes.
  protected readonly filters = linkedSignal<Product, Record<string, string>>({
    source: this.product,
    computation: () => ({}),
  });
  protected readonly query = linkedSignal({ source: this.product, computation: () => '' });
  protected readonly expanded = linkedSignal({ source: this.product, computation: () => false });

  protected readonly showFind = computed(() => this.mode() === 'table' && this.variants().length > 12);

  /** Axes worth filtering by: 2–10 distinct values that actually group rows. */
  private readonly filterAxisNames = computed(() => {
    if (this.mode() !== 'table' || this.variants().length < 7) return [];
    return this.axes().filter((axis) => {
      if (/^Product No/i.test(axis)) return false; // catalogue codes are searched, not filtered
      if (this.variants().some((v) => (v.attributes[axis] ?? '').length > 26)) return false; // long text (set contents)
      const n = new Set(this.variants().map((v) => v.attributes[axis]).filter((x) => x && x !== '—')).size;
      return n >= 2 && n <= 10 && n < this.variants().length;
    });
  });

  private matches(v: ProductVariant, filters: Record<string, string>, q: string, skipAxis?: string): boolean {
    for (const [axis, value] of Object.entries(filters)) {
      if (axis !== skipAxis && v.attributes[axis] !== value) return false;
    }
    if (!q) return true;
    return norm(`${v.label} ${Object.values(v.attributes).join(' ')}`).includes(q);
  }

  protected readonly filterAxes = computed<AxisFilter[]>(() => {
    const filters = this.filters();
    const q = norm(this.query());
    return this.filterAxisNames().map((axis) => {
      const pool = this.variants().filter((v) => this.matches(v, filters, q, axis));
      const values: string[] = [];
      for (const v of this.variants()) {
        const x = v.attributes[axis];
        if (x && x !== '—' && !values.includes(x)) values.push(x);
      }
      return { axis, values: values.map((value) => ({ value, count: pool.filter((v) => v.attributes[axis] === value).length })) };
    });
  });

  protected readonly rows = computed(() => {
    const filters = this.filters();
    const q = norm(this.query());
    return this.variants().filter((v) => this.matches(v, filters, q));
  });

  protected readonly visibleRows = computed(() => {
    const rows = this.rows();
    if (this.expanded() || rows.length <= ROW_LIMIT + 5) return rows;
    const i = rows.findIndex((v) => v.id === this.selectedId());
    return i >= ROW_LIMIT ? rows : rows.slice(0, ROW_LIMIT);
  });

  protected readonly hasFilters = computed(() => Object.keys(this.filters()).length > 0 || !!this.query());

  constructor() {
    // Axis chips that narrow the table to exactly one size select it.
    effect(() => {
      const rows = this.rows();
      const usedChips = Object.keys(this.filters()).length > 0;
      if (usedChips && rows.length === 1) {
        untracked(() => this.choose(rows[0].id));
      }
    });
  }

  protected choose(id: string | null): void {
    if (id !== this.selectedId()) this.selectedChange.emit(id);
  }

  protected toggleFilter(axis: string, value: string): void {
    this.filters.update((f) => {
      const next = { ...f };
      if (next[axis] === value) delete next[axis];
      else next[axis] = value;
      return next;
    });
  }

  protected clearFilters(): void {
    this.filters.set({});
    this.query.set('');
  }

  protected cell(v: ProductVariant, axis: string): string {
    return v.attributes[axis] ?? '—';
  }
}
