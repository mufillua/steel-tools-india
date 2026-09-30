import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

import { ProductImage } from '../product-image/product-image';

/**
 * Product photos on a drawing-sheet frame. One main image; thumbnails appear only when
 * a product has more than one photo. No photo → category placeholder (never a stock image).
 */
@Component({
  selector: 'sti-product-gallery',
  imports: [ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="gal">
      <div class="gal__frame">
        <span class="gal__mark gal__mark--tl" aria-hidden="true"></span>
        <span class="gal__mark gal__mark--tr" aria-hidden="true"></span>
        <span class="gal__mark gal__mark--bl" aria-hidden="true"></span>
        <span class="gal__mark gal__mark--br" aria-hidden="true"></span>
        <sti-product-image
          [src]="images()[active()]"
          [alt]="altFor(active())"
          [category]="category()"
          ratio="1 / 1"
          [eager]="true"
        />
      </div>

      <figcaption class="gal__strip">
        <span>Fig. {{ pad(active() + 1) }}@if (images().length > 1) { <span class="gal__of"> / {{ pad(images().length) }}</span>}</span>
        <span class="gal__note">{{ images().length ? 'Image for reference' : 'Photo to be added' }}</span>
      </figcaption>

      @if (images().length > 1) {
        <div class="gal__thumbs" role="group" aria-label="Product photos">
          @for (img of images(); track img; let i = $index) {
            <button
              type="button"
              class="gal__thumb"
              [class.is-active]="i === active()"
              [attr.aria-pressed]="i === active()"
              [attr.aria-label]="'Show photo ' + (i + 1) + ' of ' + images().length"
              (click)="active.set(i)"
            >
              <img [src]="img" alt="" loading="lazy" decoding="async" />
            </button>
          }
        </div>
      }
    </figure>
  `,
  styleUrl: './product-gallery.scss',
})
export class ProductGallery {
  readonly images = input<string[]>([]);
  readonly name = input.required<string>();
  readonly category = input('');

  /** Back to the first photo whenever the product (image list) changes. */
  protected readonly active = linkedSignal({ source: this.images, computation: () => 0 });

  protected readonly count = computed(() => this.images().length);

  protected altFor(i: number): string {
    return this.images().length > 1 ? `${this.name()} — photo ${i + 1}` : this.name();
  }

  protected pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
