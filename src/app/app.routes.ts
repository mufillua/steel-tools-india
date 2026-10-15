import { Routes } from '@angular/router';

import {
  catalogueResolver,
  productSeoResolver,
  productTitleResolver,
} from './pages/product-detail/product-detail.resolvers';
import { categorySeoResolver, categoryTitleResolver } from './pages/category/category.resolvers';

/**
 * All pages are lazy-loaded. `title` feeds the SiteTitleStrategy (" | Steel Tools India" suffix).
 * `data.seo` / `resolve.seo` feed the meta description, Open Graph tags and JSON-LD (see SeoService).
 */
export const routes: Routes = [
  {
    path: '',
    resolve: { catalogue: catalogueResolver },
    pathMatch: 'full',
    title: 'Steel Tools India | Industrial Tools Supplier in Kolkata, Since 1957',
    data: { seo: { jsonLd: 'home' } },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    resolve: { catalogue: catalogueResolver },
    title: 'Industrial Tools Catalogue — All Products',
    data: { seo: { description: 'Search 600+ industrial tools by product, size or standard — R★R Brand, Taparia, Miranda and lifting equipment. Steel Tools India, Kolkata.' } },
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
    title: 'Product Categories',
    data: { seo: { description: 'All 20 product categories at Steel Tools India, Kolkata — machine tool accessories, centres, cutting tools, hand tools, hoists, rigging and material handling.' } },
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'categories/:slug',
    title: categoryTitleResolver,
    resolve: { catalogue: catalogueResolver, seo: categorySeoResolver },
    loadComponent: () => import('./pages/category/category').then((m) => m.CategoryPage),
  },
  {
    path: 'about-us',
    resolve: { catalogue: catalogueResolver },
    title: 'About Us — Tool Suppliers in Kolkata since 1957',
    data: {
      seo: {
        description: 'Steel Tools India — a Kolkata tools business on N. S. Road since 1957, owned by Huzefa Maimoon. Tool accessories, cutting tools, hand tools, lifting gear.',
        jsonLd: 'business',
      },
    },
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    resolve: { catalogue: catalogueResolver },
    title: 'Contact Us — N. S. Road, Kolkata',
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
    data: { seo: { description: 'Request a quote from Steel Tools India, Kolkata on WhatsApp or email — tell us the product, size and quantity you need and we reply with price and availability.' } },
    loadComponent: () => import('./pages/quote/quote').then((m) => m.Quote),
  },
  { path: 'about', redirectTo: 'about-us' },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
