import { TestBed } from '@angular/core/testing';

import { PRODUCTS_PER_PAGE } from '../config/catalogue.config';
import { ProductService } from './product.service';

describe('ProductService (catalogue data)', () => {
  let svc: ProductService;

  beforeEach(async () => {
    svc = TestBed.inject(ProductService);
    await svc.load();
  });

  it('loads the full catalogue', () => {
    expect(svc.status()).toBe('ready');
    expect(svc.products().length).toBeGreaterThan(250);
    expect(svc.categories().length).toBe(20);
  });

  it('has unique slugs and every product in a known category', () => {
    const slugs = svc.products().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const cats = svc.categories().map((c) => c.slug);
    for (const p of svc.products()) expect(cats).toContain(p.category);
  });

  it('never carries prices', () => {
    for (const p of svc.products()) {
      expect(JSON.stringify(p)).not.toMatch(/price|₹|rs\.\s?\d|\/-/i);
    }
  });

  it('finds products by size or taper and ranks name matches first', () => {
    const er32 = svc.searchProducts('ER-32');
    expect(er32.length).toBeGreaterThan(0);
    expect(er32.map((p) => p.slug)).toContain('bt-50-er-collet-chuck');
    const q = 'bt-40 er';
    const ranked = [...svc.searchProducts(q)].sort((a, b) => svc.relevance(b, q) - svc.relevance(a, q));
    expect(ranked[0].slug).toBe('bt-40-er-collet-chuck');
    expect(svc.searchProducts('zzqq').length).toBe(0);
  });

  it('filters by category, type and brand', () => {
    const hand = svc.filterProducts({ categories: ['industrial-hand-tools'] });
    expect(hand.every((p) => p.category === 'industrial-hand-tools')).toBeTrue();
    const punches = svc.filterProducts({ subcategories: ['Letter & Figure Punches'] });
    expect(punches.map((p) => p.slug)).toEqual([
      'marking-letter-figure-punches',
      'dotted-letter-figure-punches',
      'reverse-letter-figure-punch-sets',
    ]);
    expect(svc.filterProducts({ brands: ['Miranda'] }).every((p) => p.brand === 'Miranda')).toBeTrue();
  });

  it('includes the Taparia range with product numbers and no empty categories', () => {
    const taparia = svc.products().filter((p) => p.brand === 'Taparia');
    expect(taparia.length).toBeGreaterThan(300);
    expect(taparia.every((p) => p.variantAxes[0] === 'Product No.')).toBeTrue();
    for (const c of svc.categories()) expect(c.productCount).toBeGreaterThan(0);
    const nonSparking = svc.getProductBySlug('taparia-non-sparking-adjustable-wrenches')!;
    expect(nonSparking.variants.some((v) => v.attributes['Material']?.includes('BE-CU'))).toBeTrue();
  });

  it('shows no brand for the lifting & material handling range (client request)', () => {
    const lifting = svc.products().filter((p) => p.source.doc === 'LIFTING');
    expect(lifting.length).toBeGreaterThan(60);
    expect(lifting.every((p) => p.brand === '')).toBeTrue();
    expect(svc.brands()).not.toContain('');
    // the brochure's maker name must not appear anywhere in the catalogue text
    const text = JSON.stringify(svc.products()).toLowerCase();
    expect(/safelift|\bsaif\b/.test(text)).toBeFalse();
    for (const slug of ['material-handling', 'lifting-chain-rigging']) expect(svc.categories().find((c) => c.slug === slug)?.brands).toEqual([]);
  });

  it('uses 12 products per page', () => {
    expect(PRODUCTS_PER_PAGE).toBe(12);
  });
});
