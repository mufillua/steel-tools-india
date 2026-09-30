import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { CONTACT_PATH, PRIMARY_NAV, QUOTE_PATH } from '../../config/navigation.config';
import { CATEGORIES } from '../../data/categories';
import { formatHours } from '../business-hours/business-hours.util';
import { Icon } from '../icon/icon';

@Component({
  selector: 'sti-footer',
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly categories = CATEGORIES;
  protected readonly year = new Date().getFullYear();
  protected readonly fmt = formatHours;

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  /** Hidden where the page already ends with its own quote CTA (home) or is the quote page. */
  protected readonly showCta = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    return path !== '/' && path !== '' && !path.startsWith(QUOTE_PATH);
  });

  protected readonly quickLinks = [
    ...PRIMARY_NAV.map(({ label, path }) => ({ label, path })),
    { label: 'Contact', path: CONTACT_PATH },
    { label: 'Get A Quote', path: QUOTE_PATH },
  ];
}
