import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Every public page is prerendered to static HTML at build time, so search engines and
 * link previews (WhatsApp, email, social) see real titles, descriptions and content.
 * Each product page gets its own file: /products/<slug>/index.html.
 * Anything else is rendered in the browser (see README → hosting: fall back to index.csr.html).
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'products', renderMode: RenderMode.Prerender },
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { ALL_PRODUCTS } = await import('./data/products');
      return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
    },
  },
  { path: 'categories', renderMode: RenderMode.Prerender },
  { path: 'about-us', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'get-a-quote', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
