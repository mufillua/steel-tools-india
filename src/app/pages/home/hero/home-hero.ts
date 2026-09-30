import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COMPANY } from '../../../config/company.config';
import { QUOTE_PATH } from '../../../config/navigation.config';
import { Icon } from '../../../components/icon/icon';
import { ProductService } from '../../../services/product.service';

/** Products shown on the hero "drawing sheet". Callouts are read from their real data. */
const SHEET_MAIN = 'bt-50-er-collet-chuck';
const DETAIL_A = 'male-revolving-centre-carbide-tipped-standard';
const DETAIL_B = 't-slot-nut';

@Component({
  selector: 'sti-home-hero',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHero {
  private readonly catalogue = inject(ProductService);

  protected readonly company = COMPANY;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly ready = computed(() => this.catalogue.status() === 'ready');

  protected readonly main = computed(() => this.catalogue.getProductBySlug(SHEET_MAIN) ?? null);
  protected readonly detailA = computed(() => this.catalogue.getProductBySlug(DETAIL_A) ?? null);
  protected readonly detailB = computed(() => this.catalogue.getProductBySlug(DETAIL_B) ?? null);

  /** Callout text for the drawing sheet — every value is derived from the product data. */
  protected readonly callouts = computed(() => ({
    collet: this.axisRange(SHEET_MAIN, 'Collet'),
    length: this.axisRange(SHEET_MAIN, 'Length'),
    detailA: this.axisRange(DETAIL_A, 'Model'),
    detailB: this.axisRange(DETAIL_B, 'Suitable for screw size'),
  }));

  /** "ER-16 – ER-50" style range from a product's variant axis. */
  private axisRange(slug: string, axis: string): string {
    const p = this.catalogue.getProductBySlug(slug);
    const values = [...new Set(p?.variants.map((v) => v.attributes[axis]).filter(Boolean))];
    if (!values.length) return '';
    return values.length === 1 ? values[0] : `${values[0]} – ${values[values.length - 1]}`;
  }

  protected readonly stats = computed(() => [
    { value: this.catalogue.products().length, label: 'Products listed' },
    { value: this.catalogue.categories().length, label: 'Categories' },
    { value: this.catalogue.variantCount(), label: 'Sizes & variants' },
  ]);
}
