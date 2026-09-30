import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../components/icon/icon';
import { CATEGORIES } from '../../data/categories';

@Component({
  selector: 'sti-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nf sti-section--grid">
      <div class="sti-container nf__inner">
        <p class="nf__code sti-anim-fade-up" aria-hidden="true">404</p>
        <h1 class="sti-anim-fade-up sti-delay-1">Page not found</h1>
        <p class="sti-lead sti-anim-fade-up sti-delay-2">The page you were looking for doesn't exist or has moved.</p>
        <div class="nf__actions sti-anim-fade-up sti-delay-3">
          <a class="sti-btn sti-btn--blue sti-btn--lg" routerLink="/products">Browse Products <sti-icon class="sti-btn__arrow" name="arrow-right" [size]="18" /></a>
          <a class="sti-btn sti-btn--lg" routerLink="/">Back to Home</a>
        </div>
        <nav class="nf__cats sti-anim-fade-up sti-delay-4" aria-label="Browse by category">
          <p class="nf__cats-k">Or jump to a category</p>
          <ul role="list">
            @for (c of categories; track c.slug) {
              <li><a routerLink="/products" [queryParams]="{ category: c.slug }">{{ c.name }}</a></li>
            }
          </ul>
        </nav>
      </div>
    </section>
  `,
  styles: `
    .nf { padding-block: clamp(72px, 12vw, 140px); border-bottom: 1px solid var(--sti-border); }
    .nf__inner { text-align: center; display: grid; justify-items: center; }
    .nf__code { font-family: var(--sti-font-mono); font-size: clamp(4rem, 12vw, 7rem); line-height: 1; margin: 0 0 12px; color: var(--sti-blue-200); letter-spacing: .08em; }
    .nf__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 12px; }
    .nf__cats { margin-top: 44px; max-width: 760px; }
    .nf__cats-k { margin: 0 0 12px; font-family: var(--sti-font-mono); font-size: .6875rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sti-muted); }
    .nf__cats ul { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .nf__cats a { display: inline-block; padding: 7px 14px; border: 1px solid var(--sti-border-strong); border-radius: 999px; background: #fff; font-size: var(--sti-text-sm); color: var(--sti-blue-900); text-decoration: none; transition: border-color var(--sti-dur) var(--sti-ease), background-color var(--sti-dur) var(--sti-ease), color var(--sti-dur) var(--sti-ease); }
    .nf__cats a:hover { border-color: var(--sti-blue-800); background: var(--sti-blue-800); color: #fff; }
  `,
})
export class NotFound {
  protected readonly categories = CATEGORIES;
}
