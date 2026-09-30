import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { BusinessHoursList } from '../../components/business-hours/business-hours';
import { Icon } from '../../components/icon/icon';
import { PageIntro } from '../../components/page-intro/page-intro';
import { QuoteForm } from '../../components/quote-form/quote-form';
import { COMPANY, COMPANY_ADDRESS_ONE_LINE, COMPANY_LINKS } from '../../config/company.config';
import { QUOTE_PATH } from '../../config/navigation.config';

/** /contact — every detail comes from company.config.ts. */
@Component({
  selector: 'sti-contact',
  imports: [PageIntro, Icon, RouterLink, QuoteForm, BusinessHoursList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly address = COMPANY_ADDRESS_ONE_LINE;
  protected readonly crumbs = [{ label: 'Home', link: '/' }, { label: 'Contact' }];

  /** The map is a third-party embed, so it only loads when the visitor asks for it. */
  protected readonly showMap = signal(false);
  protected readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(COMPANY_LINKS.mapsEmbed);

  protected readonly copied = signal<string | null>(null);

  protected async copy(key: string, text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(key);
      setTimeout(() => this.copied.set(null), 2000);
    } catch {
      this.copied.set(null);
    }
  }
}
