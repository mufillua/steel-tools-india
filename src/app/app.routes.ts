import { Routes } from '@angular/router';

import {
  catalogueResolver,
  productSeoResolver,
  productTitleResolver,
} from './pages/product-detail/product-detail.resolvers';

/**
 * All pages are lazy-loaded. `title` feeds the SiteTitleStrategy (" | Steel Tools India" suffix).
 * `data.seo` / `resolve.seo` feed the meta description, Open Graph tags and JSON-LD (see SeoService).
 */
export const routes: Routes = [
  {
    path: '',
    resolve: { catalogue: catalogueResolver },
    pathMatch: 'full',
    title: 'Precision Tools for Modern Manufacturing',
    data: { seo: { jsonLd: 'business' } },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    resolve: { catalogue: catalogueResolver },
    title: 'Products',
    data: { seo: { description: 'Search the Steel Tools India catalogue by product, size, taper or standard — R★R Brand, Taparia and Miranda tools plus lifting and material handling equipment, with every listed size. Enquire on WhatsApp or email.' } },
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'products/:slug',
    title: productTitleResolver,
    resolve: { seo: productSeoResolver },
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'categories',
    resolve: { catalogue: catalogueResolver },
    title: 'Categories',
    data: { seo: { description: 'Steel Tools India product categories — machine tool accessories, revolving & dead centres, hand tools and punches, solid carbide, indexable, HSS and carbide tipped tools, plus hoists, slings, rigging hardware, lifting clamps and material handling equipment.' } },
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'about-us',
    resolve: { catalogue: catalogueResolver },
    title: 'About Us',
    data: {
      seo: {
        description: 'About Steel Tools India — a Kolkata tooling business established in 1957, owned by Huzefa Maimoon. Machine tool accessories, cutting tools and hand tools.',
        jsonLd: 'business',
      },
    },
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    resolve: { catalogue: catalogueResolver },
    title: 'Contact',
    data: {
      seo: {
        description: 'Contact Steel Tools India, 67/B, N. S. Road, Room No. 37, Kolkata 700001. Phone / WhatsApp +91 98302 58198. Open Mon–Fri 10 am–6 pm, Sat 10 am–5 pm.',
        jsonLd: 'business',
      },
    },
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'get-a-quote',
    resolve: { catalogue: catalogueResolver },
    title: 'Get A Quote',
    data: { seo: { description: 'Request a quote from Steel Tools India on WhatsApp or email — tell us the product, size and quantity you need.' } },
    loadComponent: () => import('./pages/quote/quote').then((m) => m.Quote),
  },
  { path: 'about', redirectTo: 'about-us' },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
