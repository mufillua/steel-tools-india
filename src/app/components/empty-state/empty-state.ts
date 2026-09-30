import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

/** Friendly "nothing here" / error panel with projected action buttons. */
@Component({
  selector: 'sti-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="es" [class.es--error]="tone() === 'error'" role="status">
      <span class="es__icon"><sti-icon [name]="icon()" [size]="26" /></span>
      <h2 class="es__title">{{ title() }}</h2>
      @if (text()) {
        <p class="es__text">{{ text() }}</p>
      }
      <div class="es__actions"><ng-content /></div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .es {
      display: grid; justify-items: center; gap: 6px; padding: clamp(36px, 6vw, 64px) 24px; text-align: center;
      border: 1.5px dashed var(--sti-blue-300); border-radius: var(--sti-radius-md);
      background: linear-gradient(160deg, var(--sti-surface), var(--sti-blue-50));
    }
    .es--error { border-color: var(--sti-red-200); }
    .es__icon {
      display: grid; place-items: center; width: 56px; height: 56px; margin-bottom: 8px; border-radius: 50%;
      background: var(--sti-blue-100); color: var(--sti-blue-800);
    }
    .es--error .es__icon { background: var(--sti-red-100); color: var(--sti-red-700); }
    .es__title { margin: 0; font-size: 1.6rem; }
    .es__text { margin: 0; max-width: 46ch; color: var(--sti-muted); }
    .es__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 14px; }
    .es__actions:empty { display: none; }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly text = input('');
  readonly icon = input<IconName>('grid');
  readonly tone = input<'neutral' | 'error'>('neutral');
}
