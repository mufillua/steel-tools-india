import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { COMPANY } from '../../config/company.config';
import { Product, ProductVariant } from '../../models/product.model';
import { EmailButton, WhatsappButton } from '../enquiry-buttons/enquiry-buttons';

/**
 * "Direct Enquiry" block for the product page: WhatsApp + email, both pre-filled
 * with this product and the size selected on the page.
 */
@Component({
  selector: 'sti-enquiry-panel',
  imports: [WhatsappButton, EmailButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="enq" aria-labelledby="enq-title">
      <p class="enq__kicker">Direct Enquiry</p>
      <h2 id="enq-title" class="enq__title">Interested in this product?</h2>
      <p class="enq__text">
        Get pricing, availability and product details from {{ company.name }}.
        @if (variant(); as v) {
          <span class="enq__variant">Your enquiry will include <strong>{{ v.label }}</strong>.</span>
        }
      </p>

      <div class="enq__actions">
        <sti-whatsapp-button [product]="product()" [variant]="variant()" label="WhatsApp Enquiry" size="xl" [block]="true" />
        <sti-email-button [product]="product()" [variant]="variant()" label="Request Quote by Email" size="xl" [block]="true" />
      </div>
    </section>
  `,
  styleUrl: './enquiry-panel.scss',
})
export class EnquiryPanel {
  readonly product = input.required<Product>();
  readonly variant = input<ProductVariant | null>(null);

  protected readonly company = COMPANY;
}
