import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { COMPANY } from '../../config/company.config';
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

/** "<Category> Supplier in Kolkata" (SiteTitleStrategy adds " | Steel Tools India"). */
export const categoryTitleResolver: ResolveFn<string> = async (route) => {
  const c = await categoryFor(route.paramMap.get('slug'));
  return c ? `${c.name} Supplier in ${COMPANY.city}` : 'Category Not Found';
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
    description: clip(`${c.name} in ${COMPANY.city} from ${COMPANY.name} (since ${COMPANY.foundedYear}) — ${c.description} Enquire on WhatsApp or email.`),
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
