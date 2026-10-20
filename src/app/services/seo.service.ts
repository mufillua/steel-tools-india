import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { COMPANY, COMPANY_LINKS } from '../config/company.config';
import { CATEGORIES } from '../data/categories';

/** Per-route SEO data. Supplied as route `data.seo` (static or resolved). */
export interface SeoData {
  description?: string;
  /** Site-relative image path, e.g. assets/products/…webp */
  image?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
  /**
   * schema.org JSON-LD object(s) for this page. 'business' = the Steel Tools India store record;
   * 'home' = store record + WebSite (the site name Google shows in results).
   */
  jsonLd?: object | object[] | 'business' | 'home';
}

export const DEFAULT_DESCRIPTION =
  `${COMPANY.name}, ${COMPANY.city} — industrial tools supplier since ${COMPANY.foundedYear}: machine tool accessories, ` +
  'cutting tools, Taparia hand tools, hoists and lifting equipment.';

const DEFAULT_IMAGE = 'assets/brand/sti-logo-full.png';
const HERO_IMAGE = 'assets/hero/product-range.webp';

const DAY_URI = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
  (d) => `https://schema.org/${d}`,
);

/** schema.org business record built only from company.config.ts and the category list (Home, About, Contact). */
export function localBusinessJsonLd(siteUrl = COMPANY.siteUrl): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HardwareStore',
    '@id': `${siteUrl}/#business`,
    name: COMPANY.name,
    slogan: COMPANY.tagline,
    description: DEFAULT_DESCRIPTION,
    foundingDate: String(COMPANY.foundedYear),
    url: siteUrl,
    logo: `${siteUrl}/${DEFAULT_IMAGE}`,
    image: [`${siteUrl}/${DEFAULT_IMAGE}`, `${siteUrl}/${HERO_IMAGE}`],
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    hasMap: COMPANY_LINKS.mapsSearch,
    sameAs: [COMPANY_LINKS.instagram],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.lines.join(', '),
      addressLocality: COMPANY.address.city,
      addressRegion: 'West Bengal',
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
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phoneE164,
      email: COMPANY.email,
      contactType: 'sales',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${COMPANY.name} product catalogue`,
      itemListElement: CATEGORIES.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.name,
        url: `${siteUrl}/categories/${c.slug}`,
      })),
    },
  };
}

/** WebSite record — gives Google the site name to show next to the URL. */
export function websiteJsonLd(siteUrl = COMPANY.siteUrl): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: COMPANY.name,
    alternateName: ['Steel Tools Ind', siteUrl.replace(/^https?:\/\//, '')],
    url: `${siteUrl}/`,
    inLanguage: 'en-IN',
    publisher: { '@id': `${siteUrl}/#business` },
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
    if (seo.jsonLd === 'home') seo = { ...seo, jsonLd: [websiteJsonLd(), localBusinessJsonLd()], image: seo.image ?? HERO_IMAGE };
    const description = seo.description ?? DEFAULT_DESCRIPTION;
    const url = this.absolute(this.canonicalPath(path));
    const image = this.absolute(`/${seo.image ?? DEFAULT_IMAGE}`);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: seo.noindex ? 'noindex, follow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:site_name', content: COMPANY.name });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
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

  /**
   * Canonical path: query strings are dropped, except that
   * - a product list filtered to exactly one category (/products?category=x, any page) points at that category's
   *   landing page, /categories/x, which lists every product in it;
   * - a plain list page (/products?page=3) keeps its page number, so Google treats each page as its own page and
   *   follows the product links on it (pointing page 3 at page 1 would tell Google to ignore it).
   */
  private canonicalPath(path: string): string {
    const [base, query = ''] = path.split('#')[0].split('?');
    if (base === '/products' && query) {
      const params = new URLSearchParams(query);
      const page = params.get('page') ?? '';
      const keys = [...params.keys()].filter((k) => k !== 'page');
      const cat = params.get('category') ?? '';
      if (keys.length === 1 && keys[0] === 'category' && /^[a-z0-9-]+$/.test(cat)) return `/categories/${cat}`;
      if (keys.length === 0 && /^[1-9]\d{0,3}$/.test(page) && page !== '1') return `/products?page=${page}`;
    }
    return base;
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
