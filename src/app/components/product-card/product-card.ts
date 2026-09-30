import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { WhatsappButton } from '../enquiry-buttons/enquiry-buttons';
import { ProductImage } from '../product-image/product-image';

@Component({
  selector: 'sti-product-card',
  imports: [RouterLink, ProductImage, WhatsappButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Heading level for the product name, so cards fit any page outline. */
  readonly headingLevel = input<2 | 3>(3);

  private readonly catalogue = inject(ProductService);

  protected readonly categoryName = computed(() => this.catalogue.categoryName(this.product().category));
  protected readonly optionCount = computed(() => this.product().variants.length);
}
