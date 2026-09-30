import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  checked: boolean;
}

export interface FilterGroup {
  /** Heading for a nested group (e.g. the category a set of types belongs to). */
  title: string;
  options: FilterOption[];
}

export type FilterKind = 'category' | 'type' | 'brand';

/**
 * Presentational filter panel — used in the desktop sidebar and inside the mobile drawer.
 * Counts are "how many results you'd get", computed by the page.
 */
@Component({
  selector: 'sti-product-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
})
export class ProductFilters {
  readonly categories = input.required<FilterOption[]>();
  readonly typeGroups = input.required<FilterGroup[]>();
  readonly brands = input.required<FilterOption[]>();
  readonly activeCount = input(0);

  readonly toggle = output<{ kind: FilterKind; value: string }>();
  readonly clearAll = output<void>();
}
