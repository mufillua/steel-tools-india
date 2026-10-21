import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { COMPANY } from '../../config/company.config';
import { SEARCHED_BRANDS } from '../../config/seo-keywords.config';
import { Product } from '../../models/product.model';
import { SeoData, SeoService } from '../../services/seo.service';
import { ProductService } from '../../services/product.service';

/** Waits for the catalogue (a no-op after the first load) and returns the product for :slug. */
async function productFor(slug: string | null) {
  const catalogue = inject(ProductService);
  await catalogue.load();
  return slug ? catalogue.getProductBySlug(slug) : undefined;
}

const clip = (text: string, max = 158) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:.—-]+\S*$/, '')}…`;
};

/**
 * Waits for the catalogue before the page renders. With prerendering this matters: the browser's first
 * render must match the prerendered HTML (which already contains the products) for hydration to reuse it.
 */
export const catalogueResolver: ResolveFn<boolean> = () =>
  inject(ProductService)
    .load()
    .then(() => true);

/** "Taparia Heavy Duty Pipe Wrenches" — the brand people search by, in front of the name (not repeated). */
export const searchName = (p: Product) =>
  SEARCHED_BRANDS.includes(p.brand) && !p.name.toLowerCase().includes(p.brand.toLowerCase()) ? `${p.brand} ${p.name}` : p.name;

/** Page title: "<Brand> <Product> in Kolkata" (SiteTitleStrategy adds " | Steel Tools India"). */
export const productTitleResolver: ResolveFn<string> = async (route) => {
  const p = await productFor(route.paramMap.get('slug'));
  return p ? `${searchName(p)} in ${COMPANY.city}` : 'Product Not Found';
};

/** Description, image and schema.org data built from the product record only. */
export const productSeoResolver: ResolveFn<SeoData> = async (route) => {
  const catalogue = inject(ProductService);
  const seo = inject(SeoService);
  const p = await productFor(route.paramMap.get('slug'));
  if (!p) return { noindex: true, description: 'This product could not be found in the Steel Tools India catalogue.' };

  const category = catalogue.getCategory(p.category);
  const url = seo.absolute(`/products/${p.slug}`);
  // What it is and the sizes, then the call to action, then the catalogue text (Google cuts at ~155 characters).
  const description = clip(
    `${searchName(p)}${p.standard ? ` (${p.standard})` : ''} — ${p.summary}. ` +
      `Get a quote on WhatsApp from ${COMPANY.name}, ${COMPANY.city}. ${p.description}`,
  );

  return {
    description,
    image: p.images[0],
    type: 'product',
    // No schema.org Product record: Google requires a price, reviews or ratings for it ("Product snippets" errors
    // in Search Console), and the site shows none. The breadcrumb trail still shows in search results.
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: seo.absolute('/') },
          { '@type': 'ListItem', position: 2, name: 'Products', item: seo.absolute('/products') },
          ...(category
            ? [{ '@type': 'ListItem', position: 3, name: category.name, item: seo.absolute(`/categories/${category.slug}`) }]
            : []),
          { '@type': 'ListItem', position: category ? 4 : 3, name: p.name, item: url },
        ],
      },
    ],
  };
};
