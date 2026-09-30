import { TestBed } from '@angular/core/testing';

import { COMPANY } from '../config/company.config';
import { EnquiryService } from './enquiry.service';
import { ProductService } from './product.service';

describe('EnquiryService (WhatsApp / email messages)', () => {
  let enquiry: EnquiryService;
  let catalogue: ProductService;

  beforeEach(async () => {
    enquiry = TestBed.inject(EnquiryService);
    catalogue = TestBed.inject(ProductService);
    await catalogue.load();
  });

  const chuck = () => catalogue.getProductBySlug('bt-50-er-collet-chuck')!;

  it('builds a product message without a size', () => {
    const msg = enquiry.whatsappMessage(chuck());
    expect(msg).toContain(`Hello ${COMPANY.name},`);
    expect(msg).toContain('Product: BT-50 ER Collet Chuck');
    expect(msg).toContain('Category: Machine Tool Accessories');
    expect(msg).toContain('Standard: DIN 6499');
    expect(msg).not.toContain('Collet:');
  });

  it('adds each attribute of the selected size', () => {
    const v = chuck().variants.find((x) => x.id === 'er-32-150l')!;
    const msg = enquiry.whatsappMessage(chuck(), v);
    expect(msg).toContain('Collet: ER-32');
    expect(msg).toContain('Length: 150L');
    expect(msg).toContain('?variant=er-32-150l');
  });

  it('points WhatsApp at the configured number and email at the configured address', () => {
    expect(enquiry.whatsappUrl(chuck())).toMatch(new RegExp(`^https://wa\\.me/${COMPANY.whatsappDigits}\\?text=`));
    const mail = enquiry.emailUrl(chuck());
    expect(mail.startsWith(`mailto:${COMPANY.email}?subject=`)).toBeTrue();
    expect(decodeURIComponent(mail)).toContain('Quote Request - BT-50 ER Collet Chuck');
  });

  it('builds the quote-form message and leaves out empty fields', () => {
    const msg = enquiry.quoteMessage({
      name: 'Ravi',
      company: '',
      phone: '',
      email: 'ravi@example.com',
      requirement: 'M12 taps',
      quantity: '10',
      message: '',
    });
    expect(msg).toContain('Name: Ravi');
    expect(msg).toContain('Email: ravi@example.com');
    expect(msg).toContain('Product / Requirement: M12 taps');
    expect(msg).toContain('Quantity: 10');
    expect(msg).not.toContain('Company:');
    expect(msg).not.toContain('Message:');
  });
});
