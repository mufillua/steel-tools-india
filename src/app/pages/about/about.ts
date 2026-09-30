import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatHours } from '../../components/business-hours/business-hours.util';
import { CategoryIcon } from '../../components/category-icon/category-icon';
import { Icon } from '../../components/icon/icon';
import { PageIntro } from '../../components/page-intro/page-intro';
import { COMPANY, COMPANY_ADDRESS_ONE_LINE, COMPANY_LINKS } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';
import { ProductService } from '../../services/product.service';

/**
 * /about-us — heritage-led, but built only on verified facts:
 * the name, "Since 1957", Kolkata address, and what the catalogue itself contains.
 * No invented milestones, people, awards or claims.
 */
@Component({
  selector: 'sti-about',
  imports: [PageIntro, RouterLink, Icon, CategoryIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly catalogue = inject(ProductService);
  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly address = COMPANY_ADDRESS_ONE_LINE;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly crumbs = [{ label: 'Home', link: '/' }, { label: 'About Us' }];

  protected readonly fmt = formatHours;
  protected readonly initials = COMPANY.owner.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  protected readonly thisYear = new Date().getFullYear();
  protected readonly years = this.thisYear - COMPANY.foundedYear;
  /** Decade ticks for the "steel rule" from 1957 to today — a scale, not a timeline of events. */
  protected readonly ticks = (() => {
    const start = COMPANY.foundedYear;
    const span = this.thisYear - start;
    const out: { pos: number; major: boolean; label?: number }[] = [];
    for (let y = start; y <= this.thisYear; y++) {
      if (y % 5 !== 0) continue;
      out.push({ pos: ((y - start) / span) * 100, major: y % 10 === 0, label: y % 10 === 0 ? y : undefined });
    }
    return out;
  })();

  protected readonly ready = computed(() => this.catalogue.status() === 'ready');
  protected readonly stats = computed(() => ({
    products: this.catalogue.products().length,
    sizes: this.catalogue.products().reduce((n, p) => n + p.variants.length, 0),
    categories: this.catalogue.categories().length,
  }));

  /** Which catalogue categories each brand appears in — derived from the data. */
  protected readonly brands = computed(() =>
    this.catalogue.brands().map((brand) => ({
      brand,
      categories: this.catalogue
        .categories()
        .filter((c) => this.catalogue.products().some((p) => p.brand === brand && p.category === c.slug)),
      count: this.catalogue.products().filter((p) => p.brand === brand).length,
    })).sort((a, b) => b.count - a.count),
  );

  constructor() {
    this.catalogue.load();
  }
}
