import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Shimmering placeholder cards shown while the catalogue loads. */
@Component({
  selector: 'sti-product-grid-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-busy': 'true', 'aria-label': 'Loading products', role: 'status' },
  template: `
    @for (i of items(); track i) {
      <div class="sk" aria-hidden="true">
        <span class="sk__img"></span>
        <span class="sk__line sk__line--s"></span>
        <span class="sk__line"></span>
        <span class="sk__line sk__line--m"></span>
        <span class="sk__btns"><span></span><span></span></span>
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    .sk {
      display: grid; gap: 10px; padding-bottom: 18px; overflow: hidden;
      border: 1px solid var(--sti-border); border-radius: var(--sti-radius-md); background: var(--sti-surface);
    }
    .sk__img, .sk__line, .sk__btns span {
      display: block; border-radius: 3px;
      background: linear-gradient(90deg, var(--sti-blue-100), var(--sti-blue-50), var(--sti-blue-100));
      background-size: 200% 100%; animation: sti-shimmer 1.3s linear infinite;
    }
    .sk__img { aspect-ratio: 4 / 3; border-radius: 0; margin-bottom: 8px; }
    .sk__line { height: 12px; margin-inline: 18px; width: 70%; }
    .sk__line--s { width: 35%; height: 9px; }
    .sk__line--m { width: 50%; }
    .sk__btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 18px 0; }
    .sk__btns span { height: 38px; }
  `,
})
export class ProductGridSkeleton {
  readonly count = input(8);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
