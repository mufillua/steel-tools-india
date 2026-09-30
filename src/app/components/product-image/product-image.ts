import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';

import { CategoryIcon as CategoryIconName } from '../../models/category.model';
import { CATEGORIES } from '../../data/categories';
import { CategoryIcon } from '../category-icon/category-icon';

/**
 * Product photo on a consistent pastel "drawing sheet" panel.
 * No image, or a broken image → a clean category placeholder (never a stock photo).
 */
@Component({
  selector: 'sti-product-image',
  imports: [CategoryIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi" [class.pi--placeholder]="showPlaceholder()" [style.aspect-ratio]="ratio()">
      @if (!showPlaceholder()) {
        <img
          #img
          [src]="src()"
          [alt]="alt()"
          [attr.loading]="eager() ? 'eager' : 'lazy'"
          [attr.fetchpriority]="eager() ? 'high' : null"
          decoding="async"
          (load)="loaded.set(true)"
          (error)="failed.set(true)"
          [class.is-loaded]="loaded()"
        />
      } @else {
        <span class="pi__ph">
          <sti-category-icon [name]="icon()" [size]="72" />
          <span class="pi__ph-text">Photo to be added</span>
        </span>
      }
    </div>
  `,
  styleUrl: './product-image.scss',
})
export class ProductImage {
  readonly src = input<string | undefined>(undefined);
  readonly alt = input('');
  readonly category = input('');
  readonly ratio = input('4 / 3');
  readonly eager = input(false);

  // Reset whenever the source changes (the gallery swaps src on one instance).
  protected readonly loaded = linkedSignal({ source: this.src, computation: () => false });
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });

  private readonly img = viewChild<ElementRef<HTMLImageElement>>('img');

  constructor() {
    // A prerendered image can finish loading before the app hydrates, so its (load) event is missed.
    afterNextRender(() => {
      const el = this.img()?.nativeElement;
      if (el?.complete && el.naturalWidth > 0) this.loaded.set(true);
    });
  }

  protected readonly showPlaceholder = computed(() => !this.src() || this.failed());
  protected readonly icon = computed<CategoryIconName>(
    () => CATEGORIES.find((c) => c.slug === this.category())?.icon ?? 'taper',
  );
}
