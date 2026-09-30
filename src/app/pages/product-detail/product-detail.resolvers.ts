import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { COMPANY } from '../../config/company.config';
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

/** Page title: "<Product>" (SiteTitleStrategy adds " | Steel Tools India"). */
export const productTitleResolver: ResolveFn<string> = async (route) =>
  (await productFor(route.paramMap.get('slug')))?.name ?? 'Product Not Found';

/** Description, image and schema.org data built from the product record only. */
export const productSeoResolver: ResolveFn<SeoData> = async (route) => {
  const catalogue = inject(ProductService);
  const seo = inject(SeoService);
  const p = await productFor(route.paramMap.get('slug'));
  if (!p) return { noindex: true, description: 'This product could not be found in the Steel Tools India catalogue.' };

  const category = catalogue.getCategory(p.category);
  const url = seo.absolute(`/products/${p.slug}`);
  const description = clip(
    `${p.name}${p.standard ? ` (${p.standard})` : ''} — ${p.summary}. ${p.description} Enquire with ${COMPANY.name}, ${COMPANY.city}.`,
  );

  return {
    description,
    image: p.images[0],
    type: 'product',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: p.description,
        url,
        category: category?.name,
        ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        ...(p.images.length ? { image: p.images.map((i) => seo.absolute(`/${i}`)) } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: seo.absolute('/') },
          { '@type': 'ListItem', position: 2, name: 'Products', item: seo.absolute('/products') },
          ...(category
            ? [{ '@type': 'ListItem', position: 3, name: category.name, item: seo.absolute(`/products?category=${category.slug}`) }]
            : []),
          { '@type': 'ListItem', position: category ? 4 : 3, name: p.name, item: url },
        ],
      },
    ],
  };
};
