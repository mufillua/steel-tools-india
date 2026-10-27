import { ChangeDetectionStrategy, Component, DOCUMENT, NgZone, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Icon } from '../../components/icon/icon';
import { SidekickMascot } from '../mascot/sidekick-mascot';
import { SidekickPanel } from '../panel/sidekick-panel';
import { SidekickState } from '../sidekick-state';

const TEASER_KEY = 'sti-sidekick-teased';

/**
 * The "Ask Sidekick" button, on every page. Only this button and the mascot drawing are in the main bundle;
 * the chat window, answer engine and knowledge file load when the visitor opens the chat (prefetched when idle).
 * A one-line greeting bubble appears once per browser session, a few seconds after the page settles.
 */
@Component({
  selector: 'sti-sidekick-launcher',
  imports: [Icon, SidekickMascot, SidekickPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidekick-launcher.html',
  styleUrl: './sidekick-launcher.scss',
})
export class SidekickLauncher {
  protected readonly state = inject(SidekickState);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);

  protected readonly teaser = signal(false);
  protected readonly hovered = signal(false);
  protected readonly blink = signal(false);
  private teaserTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Timers run outside Angular's zone so the app still reports itself stable (hydration waits for that);
    // the signals they set update the button on their own.
    afterNextRender(() => this.zone.runOutsideAngular(() => this.startTimers()));
  }

  private startTimers(): void {
    if (!this.isBrowser) return;
    // A blink every few seconds — a 150 ms change instead of a continuous animation.
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const blinkLater = (ms: number) =>
        setTimeout(() => {
          this.blink.set(true);
          setTimeout(() => this.blink.set(false), 150);
          blinkLater(4000 + Math.random() * 4000);
        }, ms);
      blinkLater(6000);
    }
    if (this.seenTeaser()) return;
    this.teaserTimer = setTimeout(() => {
      if (this.state.started()) return;
      this.teaser.set(true);
      this.rememberTeaser();
      this.teaserTimer = setTimeout(() => this.teaser.set(false), 9000);
    }, 6500);
  }

  protected toggle(): void {
    this.dismissTeaser();
    this.state.toggle();
  }

  protected dismissTeaser(): void {
    clearTimeout(this.teaserTimer);
    this.teaser.set(false);
  }

  private seenTeaser(): boolean {
    try {
      return this.document.defaultView?.sessionStorage.getItem(TEASER_KEY) === '1';
    } catch {
      return true;
    }
  }

  private rememberTeaser(): void {
    try {
      this.document.defaultView?.sessionStorage.setItem(TEASER_KEY, '1');
    } catch {
      /* ignore */
    }
  }
}
