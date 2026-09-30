import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  Router,
  TitleStrategy,
  createUrlTreeFromSnapshot,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { SiteTitleStrategy } from './services/site-title.strategy';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Scroll-to-top / Back-button restoration is handled in App (only when the *page* changes,
      // so filter, pagination and size-selection query-param updates never jump the page).
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled', anchorScrolling: 'enabled' }),
      // Soft cross-fade between pages; skipped automatically where unsupported,
      // and neutralised under prefers-reduced-motion in _animations.scss.
      withViewTransitions({
        skipInitialTransition: true,
        // No cross-fade when only the query string changes (filters, page, ?variant=).
        onViewTransitionCreated: ({ transition, to }) => {
          const router = inject(Router);
          const target = createUrlTreeFromSnapshot(to, []);
          if (
            router.isActive(target, {
              paths: 'exact',
              matrixParams: 'exact',
              fragment: 'ignored',
              queryParams: 'ignored',
            })
          ) {
            transition.skipTransition();
          }
        },
      }),
    ),
    { provide: TitleStrategy, useClass: SiteTitleStrategy }, provideClientHydration(withEventReplay()),
  ],
};
