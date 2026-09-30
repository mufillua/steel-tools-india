import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { CONTACT_PATH, PRIMARY_NAV, QUOTE_PATH } from '../../config/navigation.config';
import { Icon } from '../icon/icon';

const COMPACT_AFTER_PX = 24;
const DESKTOP_NAV_MIN_WIDTH = 1100; // keep in sync with $bp-nav in _variables.scss

@Component({
  selector: 'sti-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
  },
})
export class Header {
  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;
  protected readonly nav = PRIMARY_NAV;
  protected readonly quotePath = QUOTE_PATH;
  protected readonly contactPath = CONTACT_PATH;

  protected readonly compact = signal(false);
  protected readonly menuOpen = signal(false);

  private readonly toggleBtn = viewChild<ElementRef<HTMLButtonElement>>('toggleBtn');
  private readonly mobileNav = viewChild<ElementRef<HTMLElement>>('mobileNav');

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Close the mobile menu whenever navigation completes.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));

    // Lock page scroll behind the open mobile menu.
    effect(() => {
      this.document.body.classList.toggle('sti-scroll-locked', this.menuOpen());
    });

    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win) return;

      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        win.requestAnimationFrame(() => {
          this.compact.set(win.scrollY > COMPACT_AFTER_PX);
          ticking = false;
        });
      };
      const onResize = () => {
        if (win.innerWidth >= DESKTOP_NAV_MIN_WIDTH && this.menuOpen()) this.menuOpen.set(false);
      };

      onScroll();
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', onResize);
        this.document.body.classList.remove('sti-scroll-locked');
      });
    });
  }

  protected toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    if (next) {
      // Move focus into the panel once it is visible.
      setTimeout(() => this.mobileNav()?.nativeElement.querySelector<HTMLAnchorElement>('a')?.focus(), 60);
    }
  }

  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (returnFocus) this.toggleBtn()?.nativeElement.focus();
  }
}
