import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COMPANY } from '../../../config/company.config';
import { QUOTE_PATH } from '../../../config/navigation.config';
import { Icon } from '../../../components/icon/icon';
import { ProductService } from '../../../services/product.service';
import { CATEGORIES } from '../../../data/categories';

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

  /** The hero image shows one product from every category (public/assets/hero, built by scripts/images/hero/gen_hero_scene.py). */
  protected readonly categoryCount = CATEGORIES.length;
  protected readonly rangeAlt =
    'A selection of tools from the Steel Tools India range — one product from each of our ' +
    CATEGORIES.length +
    ' categories, from tool holders, centres and cutting tools to hand tools, hoists, lifting gear and pallet trucks.';

  protected readonly stats = computed(() => [
    { value: this.catalogue.products().length, label: 'Products listed' },
    { value: this.catalogue.categories().length, label: 'Categories' },
    { value: this.catalogue.variantCount(), label: 'Sizes & variants' },
  ]);
}
