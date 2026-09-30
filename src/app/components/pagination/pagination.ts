import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

type PageItem = { kind: 'page'; n: number } | { kind: 'gap'; key: string };

/**
 * Reusable pagination: Previous · 1 2 3 … 10 · Next.
 * Always shows first, last, and current ±1; gaps collapse into "…".
 */
@Component({
  selector: 'sti-pagination',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="pg" [attr.aria-label]="label()">
        <button
          type="button"
          class="pg__step"
          [disabled]="current() <= 1"
          (click)="go(current() - 1)"
          aria-label="Previous page"
        >
          <sti-icon name="chevron-right" [size]="16" class="pg__prev-icon" />
          <span class="pg__step-text">Previous</span>
        </button>

        <ol class="pg__list" role="list">
          @for (item of items(); track item.kind === 'page' ? item.n : item.key) {
            @if (item.kind === 'page') {
              <li>
                <button
                  type="button"
                  class="pg__num"
                  [class.is-current]="item.n === current()"
                  [attr.aria-current]="item.n === current() ? 'page' : null"
                  [attr.aria-label]="'Page ' + item.n"
                  (click)="go(item.n)"
                >
                  {{ item.n }}
                </button>
              </li>
            } @else {
              <li class="pg__gap" aria-hidden="true">…</li>
            }
          }
        </ol>

        <p class="pg__compact" aria-hidden="true">
          Page <strong>{{ current() }}</strong> of {{ totalPages() }}
        </p>

        <button
          type="button"
          class="pg__step"
          [disabled]="current() >= totalPages()"
          (click)="go(current() + 1)"
          aria-label="Next page"
        >
          <span class="pg__step-text">Next</span>
          <sti-icon name="chevron-right" [size]="16" />
        </button>
      </nav>
    }
  `,
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly current = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input('Pagination');
  readonly pageChange = output<number>();

  protected readonly items = computed<PageItem[]>(() => pageItems(this.current(), this.totalPages()));

  protected go(n: number): void {
    const target = Math.min(Math.max(1, n), this.totalPages());
    if (target !== this.current()) this.pageChange.emit(target);
  }
}

/** Exported for unit-style checks: which page numbers / gaps to render. */
export function pageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => ({ kind: 'page', n: i + 1 }));
  const want = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => want.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => want.add(n));
  const pages = [...want].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: PageItem[] = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) out.push({ kind: 'gap', key: `gap-${pages[i - 1]}` });
    out.push({ kind: 'page', n });
  });
  return out;
}
