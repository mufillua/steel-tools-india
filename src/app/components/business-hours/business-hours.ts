import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

import { COMPANY } from '../../config/company.config';
import { formatHours, openStatus } from './business-hours.util';

/**
 * Opening hours with a live "Open now / Closed now" line (computed in Kolkata time,
 * whatever the visitor's own time zone). Hours come from company.config.ts.
 */
@Component({
  selector: 'sti-business-hours',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.bh--dark]': 'tone() === "dark"' },
  template: `
    @if (showStatus() && status(); as st) {
      <p class="bh__status" [class.is-open]="st.open">
        <span class="bh__dot" aria-hidden="true"></span>{{ st.text }}
      </p>
    }
    <dl class="bh__list">
      @for (h of hours; track h.label) {
        <div class="bh__row" [class.is-today]="h.days.includes(today())" [class.is-closed]="!h.opens">
          <dt>{{ h.label }}@if (h.days.includes(today())) {<span class="bh__today"> · today</span>}</dt>
          <dd>{{ format(h) }}</dd>
        </div>
      }
    </dl>
  `,
  styles: `
    :host { display: block; }
    .bh__status { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: var(--sti-text-sm); font-weight: 600; color: var(--sti-red-700); }
    .bh__status.is-open { color: var(--sti-success); }
    .bh__dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, transparent); }
    .bh__list { margin: 0; }
    .bh__row { display: flex; justify-content: space-between; gap: 16px; padding: 7px 0; border-bottom: 1px dashed var(--sti-border-strong); font-size: var(--sti-text-sm); }
    .bh__row:last-child { border-bottom: 0; }
    .bh__row dt { color: var(--sti-text); }
    .bh__row dd { margin: 0; font-weight: 600; color: var(--sti-text-strong); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .bh__row.is-closed dd { color: var(--sti-muted); font-weight: 500; }
    .bh__row.is-today dt { font-weight: 600; color: var(--sti-blue-900); }
    .bh__today { font-weight: 400; color: var(--sti-muted); }
    :host(.bh--dark) .bh__row { border-color: var(--sti-on-dark-line); }
    :host(.bh--dark) .bh__row dt, :host(.bh--dark) .bh__today { color: var(--sti-on-dark-muted); }
    :host(.bh--dark) .bh__row dd { color: var(--sti-on-dark); }
    :host(.bh--dark) .bh__row.is-today dt { color: var(--sti-on-dark); }
    :host(.bh--dark) .bh__status { color: #f6b7bc; }
    :host(.bh--dark) .bh__status.is-open { color: #8fd9ad; }
  `,
})
export class BusinessHoursList {
  readonly showStatus = input(true);
  readonly tone = input<'light' | 'dark'>('light');

  protected readonly hours = COMPANY.hours;
  /** Null until running in the browser — prerendered HTML must not freeze "Open now" at build time. */
  private readonly now = signal<number | null>(null);
  protected readonly status = computed(() => {
    const now = this.now();
    return now === null ? null : openStatus(this.hours, now, COMPANY.timeZone);
  });
  protected readonly today = computed(() => this.status()?.today ?? 0);
  protected readonly format = formatHours;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.now.set(Date.now());
      // Keep "Open now" honest if the page stays open across opening/closing time.
      const timer = setInterval(() => this.now.set(Date.now()), 60_000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
