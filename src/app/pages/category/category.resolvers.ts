import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { COMPANY } from '../../config/company.config';
import { CATEGORY_SEO_HEADINGS } from '../../config/seo-keywords.config';
import { ProductService } from '../../services/product.service';
import { SeoData, SeoService } from '../../services/seo.service';

const clip = (text: string, max = 158) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:.—-]+\S*$/, '')}…`;
};

async function categoryFor(slug: string | null) {
  const catalogue = inject(ProductService);
  await catalogue.load();
  return slug ? catalogue.getCategory(slug) : undefined;
}

/** The searched-for heading of a category (seo-keywords.config.ts), falling back to its name. */
export const categoryHeading = (c: { slug: string; name: string }) => CATEGORY_SEO_HEADINGS[c.slug] ?? c.name;

/**
 * What + where + how many + the call to action (Google shows ~155 characters); the category's own text is added
 * only when there is room for a useful part of it.
 */
function categoryDescription(c: { slug: string; name: string; description: string }, products: { variants: unknown[] }[]) {
  const sizes = products.reduce((n, p) => n + p.variants.length, 0).toLocaleString('en-IN');
  const base =
    `${categoryHeading(c)} in ${COMPANY.city} — ${products.length} products, ${sizes} sizes. ` +
    `WhatsApp quote from ${COMPANY.name}, since ${COMPANY.foundedYear}.`;
  return base.length > 115 ? base : clip(`${base} ${c.description}`);
}

/** "<search heading> in Kolkata" (SiteTitleStrategy adds " | Steel Tools India"). */
export const categoryTitleResolver: ResolveFn<string> = async (route) => {
  const c = await categoryFor(route.paramMap.get('slug'));
  return c ? `${categoryHeading(c)} in ${COMPANY.city}` : 'Category Not Found';
};

/** Description + schema.org CollectionPage / ItemList / BreadcrumbList for a category landing page. */
export const categorySeoResolver: ResolveFn<SeoData> = async (route) => {
  const catalogue = inject(ProductService);
  const seo = inject(SeoService);
  const c = await categoryFor(route.paramMap.get('slug'));
  if (!c) return { noindex: true, description: 'This category could not be found in the Steel Tools India catalogue.' };

  const products = catalogue.getProductsByCategory(c.slug);
  const url = seo.absolute(`/categories/${c.slug}`);
  const image = products.find((p) => p.images.length)?.images[0];
  return {
    description: categoryDescription(c, products),
    image,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${c.name} — ${COMPANY.name}`,
        description: c.description,
        url,
        isPartOf: { '@type': 'WebSite', name: COMPANY.name, url: COMPANY.siteUrl },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: seo.absolute(`/products/${p.slug}`),
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: seo.absolute('/') },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: seo.absolute('/categories') },
          { '@type': 'ListItem', position: 3, name: c.name, item: url },
        ],
      },
    ],
  };
};
