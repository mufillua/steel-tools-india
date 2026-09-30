import { ChangeDetectionStrategy, Component, afterNextRender, computed, input, signal } from '@angular/core';

import { BusinessHoursList } from '../../components/business-hours/business-hours';
import { Icon } from '../../components/icon/icon';
import { PageIntro } from '../../components/page-intro/page-intro';
import { QuoteForm } from '../../components/quote-form/quote-form';
import { COMPANY, COMPANY_ADDRESS_ONE_LINE, COMPANY_LINKS } from '../../config/company.config';

/**
 * /get-a-quote — the quote form, plus direct contact options.
 * ?product=<slug>&variant=<id> (sent from product pages) pre-fills the product and size.
 */
@Component({
  selector: 'sti-quote',
  imports: [PageIntro, QuoteForm, Icon, BusinessHoursList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote.html',
  styleUrl: './quote.scss',
})
export class Quote {
  /** Query params (router input binding). */
  readonly product = input<string>();
  readonly variant = input<string>();

  /** Prefill is applied once live in the browser, so hydration of the prerendered (empty) form matches. */
  private readonly live = signal(false);
  protected readonly prefillProduct = computed(() => (this.live() ? this.product() : undefined));
  protected readonly prefillVariant = computed(() => (this.live() ? this.variant() : undefined));

  constructor() {
    afterNextRender(() => this.live.set(true));
  }

  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly address = COMPANY_ADDRESS_ONE_LINE;
  protected readonly crumbs = [{ label: 'Home', link: '/' }, { label: 'Get A Quote' }];
  protected readonly whatsappHello = `${COMPANY_LINKS.whatsapp}?text=${encodeURIComponent(
    `Hello ${COMPANY.name},\n\nI would like to request a quote.\n\n`,
  )}`;
}
