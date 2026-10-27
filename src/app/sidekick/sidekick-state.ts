import { Injectable, signal } from '@angular/core';

/**
 * The tiny bit of Sidekick state the always-present chat button needs. Kept apart from SidekickService so the
 * engine, catalogue search and knowledge file stay out of the main bundle until someone opens the chat.
 */
@Injectable({ providedIn: 'root' })
export class SidekickState {
  /** The chat window is open. */
  readonly open = signal(false);
  /** The chat has been opened at least once (its code stays loaded after that). */
  readonly started = signal(false);
  /** A page has a sticky bar at the bottom (product page enquiry dock) — the button moves up to clear it. */
  readonly raised = signal(false);

  show(): void {
    this.started.set(true);
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  toggle(): void {
    if (this.open()) this.hide();
    else this.show();
  }
}
