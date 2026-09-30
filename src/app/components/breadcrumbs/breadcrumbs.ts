import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  /** Omit for the current page (last item). */
  link?: string;
  queryParams?: Params;
}

/** Breadcrumb trail. The last item is rendered as the current page. */
@Component({
  selector: 'sti-breadcrumbs',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol role="list">
        @for (c of items(); track $index; let last = $last) {
          <li>
            @if (c.link && !last) {
              <a [routerLink]="c.link" [queryParams]="c.queryParams">{{ c.label }}</a>
            } @else {
              <span aria-current="page">{{ c.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    ol {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 6px;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--sti-text-xs);
      color: var(--sti-muted);
    }
    li { min-width: 0; }
    li + li::before { content: '/'; margin-right: 6px; color: var(--sti-red-400); }
    a { color: var(--sti-blue-800); text-decoration: none; }
    a:hover { text-decoration: underline; }
    [aria-current] { color: var(--sti-text); }
  `,
})
export class Breadcrumbs {
  readonly items = input.required<Crumb[]>();
}
