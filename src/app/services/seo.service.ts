import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { COMPANY } from '../config/company.config';

/** Per-route SEO data. Supplied as route `data.seo` (static or resolved). */
export interface SeoData {
  description?: string;
  /** Site-relative image path, e.g. assets/products/…webp */
  image?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
  /** schema.org JSON-LD object(s) for this page; 'business' = the Steel Tools India store record. */
  jsonLd?: object | object[] | 'business';
}

export const DEFAULT_DESCRIPTION =
  `${COMPANY.name}, ${COMPANY.city} — since ${COMPANY.foundedYear}. Machine tool accessories, lathe centres, ` +
  'cutting tools, hand tools and workshop equipment. Browse the catalogue and request a quote on WhatsApp or email.';

const DEFAULT_IMAGE = 'assets/brand/sti-logo-full.png';

const DAY_URI = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
  (d) => `https://schema.org/${d}`,
);

/** schema.org business record built only from company.config.ts (used on Home, About and Contact). */
export function localBusinessJsonLd(siteUrl = COMPANY.siteUrl): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: COMPANY.name,
    slogan: COMPANY.tagline,
    foundingDate: String(COMPANY.foundedYear),
    url: siteUrl,
    logo: `${siteUrl}/${DEFAULT_IMAGE}`,
    image: `${siteUrl}/${DEFAULT_IMAGE}`,
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.lines.join(', '),
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.pincode,
      addressCountry: 'IN',
    },
    openingHoursSpecification: COMPANY.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => DAY_URI[d]),
        opens: h.opens,
        closes: h.closes,
      })),
  };
}

/**
 * Meta description, Open Graph, canonical and JSON-LD for the current page.
 * Called by SiteTitleStrategy after every navigation, so nothing leaks from one page to the next.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(title: string, path: string, seo: SeoData = {}): void {
    if (seo.jsonLd === 'business') seo = { ...seo, jsonLd: localBusinessJsonLd() };
    const description = seo.description ?? DEFAULT_DESCRIPTION;
    const url = this.absolute(path.split('#')[0].split('?')[0]);
    const image = this.absolute(`/${seo.image ?? DEFAULT_IMAGE}`);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: seo.noindex ? 'noindex, follow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:site_name', content: COMPANY.name });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: seo.type === 'product' ? 'product' : 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    this.setCanonical(url);
    this.setJsonLd(seo.jsonLd as object | object[] | undefined);
  }

  /**
   * Absolute URL on the production domain (COMPANY.siteUrl) — used for canonical, Open Graph and JSON-LD,
   * so prerendered pages never carry a build-machine or preview origin.
   */
  absolute(path: string): string {
    const base = COMPANY.siteUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private setJsonLd(data: object | object[] | undefined): void {
    const id = 'sti-jsonld';
    this.document.getElementById(id)?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
