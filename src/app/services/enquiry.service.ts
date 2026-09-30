import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { COMPANY, COMPANY_LINKS } from '../config/company.config';
import { Product, ProductVariant } from '../models/product.model';
import { ProductService } from './product.service';

/** What the Get A Quote form collects. Empty fields are simply left out of the message. */
export interface QuoteDetails {
  name: string;
  company: string;
  phone: string;
  email: string;
  requirement: string;
  quantity: string;
  message: string;
  product?: Product | null;
  variant?: ProductVariant | null;
}

/**
 * Builds WhatsApp / email enquiry links from real product data.
 * Only fields that exist on the product are included — nothing is invented, and no price is ever sent.
 */
@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private readonly catalogue = inject(ProductService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** "Label: value" lines for the product (and selected variant, when there is one). */
  private detailLines(product: Product, variant?: ProductVariant | null): string[] {
    const lines = [
      `Product: ${product.name}`,
      `Category: ${this.catalogue.categoryName(product.category)}`,
    ];
    if (variant) {
      const attrs = Object.entries(variant.attributes).filter(([, v]) => v && v !== '—');
      // The label is only repeated when it says something the individual attributes don't.
      let rest = variant.label;
      for (const [, v] of attrs) rest = rest.split(v).join('');
      if (!attrs.length || /[a-z0-9]/i.test(rest)) lines.push(`Variant: ${variant.label}`);
      for (const [k, v] of attrs) lines.push(`${k}: ${v}`);
    }
    if (product.standard) lines.push(`Standard: ${product.standard}`);
    if (product.brand) lines.push(`Brand: ${product.brand}`);
    const link = this.productUrl(product, variant);
    if (link) lines.push(`Link: ${link}`);
    return lines;
  }

  /** Absolute link to the product page (with the selected variant) on whatever domain the site is served from. */
  private productUrl(product: Product, variant?: ProductVariant | null): string {
    // Live origin in the browser (works on preview/staging too); the production domain in prerendered HTML.
    const live = this.isBrowser ? this.document.defaultView?.location?.origin : undefined;
    const origin = live && live.startsWith('http') ? live : COMPANY.siteUrl.replace(/\/$/, '');
    return `${origin}/products/${product.slug}${variant ? `?variant=${encodeURIComponent(variant.id)}` : ''}`;
  }

  whatsappMessage(product: Product, variant?: ProductVariant | null): string {
    return [
      `Hello ${COMPANY.name},`,
      '',
      'I would like to request a quote for:',
      '',
      ...this.detailLines(product, variant),
      'Quantity: ',
      '',
      'Please share the current price, availability and other details.',
      '',
      'Thank you.',
    ].join('\n');
  }

  whatsappUrl(product: Product, variant?: ProductVariant | null): string {
    return `${COMPANY_LINKS.whatsapp}?text=${encodeURIComponent(this.whatsappMessage(product, variant))}`;
  }

  // ── Get A Quote form ─────────────────────────────────────

  /** Plain-text enquiry built from the quote form (used for WhatsApp, email body and "copy"). */
  quoteMessage(q: QuoteDetails, closing = 'Please share the current price, availability and other details.'): string {
    const field = (label: string, value: string) => (value.trim() ? [`${label}: ${value.trim()}`] : []);
    const contact = [
      ...field('Name', q.name),
      ...field('Company', q.company),
      ...field('Phone', q.phone),
      ...field('Email', q.email),
    ];
    const item = [
      ...(q.product ? this.detailLines(q.product, q.variant) : []),
      ...field(q.product ? 'Requirement' : 'Product / Requirement', q.requirement),
      ...field('Quantity', q.quantity),
    ];
    const lines = [`Hello ${COMPANY.name},`, '', 'I would like to request a quote.', ''];
    if (contact.length) lines.push(...contact, '');
    if (item.length) lines.push(...item, '');
    if (q.message.trim()) lines.push('Message:', q.message.trim(), '');
    lines.push(closing, '', 'Thank you.');
    return lines.join('\n');
  }

  quoteSubject(q: QuoteDetails): string {
    const what = q.product
      ? `${q.product.name}${q.variant ? ` (${q.variant.label})` : ''}`
      : q.requirement.trim().replace(/\s+/g, ' ').slice(0, 70);
    const who = q.company.trim() || q.name.trim();
    return `Quote Request - ${what || 'General enquiry'}${who ? ` - ${who}` : ''}`;
  }

  quoteWhatsappUrl(q: QuoteDetails): string {
    return `${COMPANY_LINKS.whatsapp}?text=${encodeURIComponent(this.quoteMessage(q))}`;
  }

  quoteEmailUrl(q: QuoteDetails): string {
    const body = this.quoteMessage(q, 'Please provide the current price and availability.');
    return `${COMPANY_LINKS.mailto}?subject=${encodeURIComponent(this.quoteSubject(q))}&body=${encodeURIComponent(body)}`;
  }

  emailUrl(product: Product, variant?: ProductVariant | null): string {
    const subject = `Quote Request - ${product.name}${variant ? ` (${variant.label})` : ''}`;
    const body = [
      `Hello ${COMPANY.name},`,
      '',
      'I would like to request a quote for:',
      '',
      ...this.detailLines(product, variant),
      'Quantity: ',
      '',
      'Please provide the current price and availability.',
      '',
      'Regards,',
      '',
    ].join('\n');
    return `${COMPANY_LINKS.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}
