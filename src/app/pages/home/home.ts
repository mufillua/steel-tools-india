import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';
import { CategoryCard } from '../../components/category-card/category-card';
import { Icon, IconName } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';
import { RevealDirective } from '../../directives/reveal.directive';
import { ProductService } from '../../services/product.service';
import { HomeHero } from './hero/home-hero';

interface WhyPoint {
  icon: IconName;
  title: string;
  text: string;
}

@Component({
  selector: 'sti-home',
  imports: [RouterLink, Icon, HomeHero, CategoryCard, ProductCard, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly catalogue = inject(ProductService);

  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly quotePath = QUOTE_PATH;

  protected readonly status = this.catalogue.status;
  protected readonly categories = this.catalogue.categories;
  protected readonly featured = computed(() => this.catalogue.getFeaturedProducts(8));
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);
  protected readonly total = computed(() => this.catalogue.products().length);

  /**
   * "Why" points — every statement is either the verified "Since 1957",
   * a count computed from the catalogue data, or a description of how this site works.
   */
  protected readonly why = computed<WhyPoint[]>(() => {
    const products = this.catalogue.products().length;
    const cats = this.catalogue.categories().length;
    return [
      {
        icon: 'gear',
        title: `Since ${COMPANY.foundedYear}`,
        text: `Established in ${COMPANY.foundedYear}, ${COMPANY.name} is based at ${COMPANY.address.lines[0].split(', ').pop()}, ${COMPANY.city}.`,
      },
      {
        icon: 'layers',
        title: 'A wide tooling catalogue',
        text: products
          ? `${products} products across ${cats} categories — from machine tool accessories to hand tools and gauges.`
          : `Products across ${cats} categories — from machine tool accessories to hand tools and gauges.`,
      },
      {
        icon: 'grid',
        title: 'Machine tool accessories',
        text: 'BT, ISO, HSK, CAT, SK and Morse taper tooling, collets, drill chucks, nuts and centres from R★R Brand.',
      },
      {
        icon: 'arrow-up-right',
        title: 'Cutting & hand tools',
        text: 'Solid carbide, indexable, HSS and carbide tipped cutting tools from R★R Brand and Miranda; pliers, spanners, sockets and workshop tools from Taparia.',
      },
      {
        icon: 'info',
        title: 'Size-level detail',
        text: 'Every product lists the sizes printed in the manufacturer’s catalogue, so you can pick the exact one you need.',
      },
      {
        icon: 'chat',
        title: 'Easy enquiry',
        text: 'Request a quote on WhatsApp or email in one tap — the product and size are filled in for you.',
      },
    ];
  });

  constructor() {
    this.catalogue.load();
  }
}
