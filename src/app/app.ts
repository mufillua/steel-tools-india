import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, Scroll } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

const pathOf = (url: string) => url.split(/[?#]/)[0];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    const router = inject(Router);
    const scroller = inject(ViewportScroller);
    let lastPath: string | null = null;
    scroller.setHistoryScrollRestoration('manual');
    const instant = { behavior: 'instant' as ScrollBehavior };

    // Back/Forward restores the previous position; a new page starts at the top;
    // a query-string-only change (filters, pagination, ?variant=) leaves the scroll alone.
    const sub = router.events.subscribe((e) => {
      if (!(e instanceof Scroll)) return;
      const end = e.routerEvent;
      const path = end instanceof NavigationEnd ? pathOf(end.urlAfterRedirects) : null;
      const pageChanged = path !== lastPath;
      lastPath = path;

      if (e.position) scroller.scrollToPosition(e.position, instant);
      else if (!e.anchor && pageChanged) scroller.scrollToPosition([0, 0], instant);
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
}
