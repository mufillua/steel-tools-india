import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { COMPANY } from '../config/company.config';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let doc: Document;
  const canonical = () => doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const ld = () => JSON.parse(doc.getElementById('sti-jsonld')?.textContent ?? 'null');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(SeoService);
    doc = TestBed.inject(DOCUMENT);
  });

  it('uses the production domain for canonical links and drops query strings', () => {
    seo.apply('Products | Steel Tools India', '/products?q=er-32&page=2');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/products`);
    expect(COMPANY.siteUrl).toBe('https://www.steeltoolsindia.in');
  });

  it('keeps the page number on plain list pages only', () => {
    seo.apply('x', '/products?page=3');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/products?page=3`);
    seo.apply('x', '/products?page=1');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/products`);
    seo.apply('x', '/products?category=slings-lashing&page=2');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/categories/slings-lashing`);
  });

  it('points a single-category product list at that category landing page', () => {
    seo.apply('x', '/products?category=slings-lashing');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/categories/slings-lashing`);
    seo.apply('x', '/products?category=slings-lashing&type=Shackles');
    expect(canonical()).toBe(`${COMPANY.siteUrl}/products`);
  });

  it('adds the WebSite and business records on the home page', () => {
    seo.apply('Steel Tools India', '/', { jsonLd: 'home' });
    const types = (ld() as { '@type': string }[]).map((x) => x['@type']);
    expect(types).toEqual(['WebSite', 'HardwareStore']);
  });
});
