import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Breadcrumbs, Crumb } from '../breadcrumbs/breadcrumbs';

/**
 * Reusable intro band for inner pages: eyebrow, H1, lead, optional projected actions.
 * Carries the pastel blueprint background so inner pages never start on flat white.
 */
@Component({
  selector: 'sti-page-intro',
  imports: [Breadcrumbs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="intro">
      <div class="intro__bg" aria-hidden="true"></div>
      <div class="sti-container sti-container--wide intro__inner">
        @if (crumbs().length) {
          <sti-breadcrumbs class="intro__crumbs" [items]="crumbs()" />
        }
        @if (eyebrow()) {
          <p class="sti-eyebrow sti-anim-fade-up">{{ eyebrow() }}</p>
        }
        <h1 class="intro__title sti-anim-fade-up sti-delay-1">{{ title() }}</h1>
        @if (lead()) {
          <p class="sti-lead intro__lead sti-anim-fade-up sti-delay-2">{{ lead() }}</p>
        }
        <div class="intro__actions sti-anim-fade-up sti-delay-3">
          <ng-content />
        </div>
      </div>
    </section>
  `,
  styleUrl: './page-intro.scss',
})
export class PageIntro {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly lead = input<string>('');
  /** Optional breadcrumb trail shown above the eyebrow. */
  readonly crumbs = input<Crumb[]>([]);
}
