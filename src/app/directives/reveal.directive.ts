import { Directive, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Scroll reveal: fades/lifts an element in the first time it enters the viewport.
 * Pure class toggle — the motion lives in _animations.scss (.sti-reveal) and is
 * disabled under prefers-reduced-motion. Elements are never hidden if JS/IO is unavailable.
 *
 *   <div stiReveal [revealDelay]="120">…</div>
 */
@Directive({
  selector: '[stiReveal]',
  host: {
    class: 'sti-reveal',
    '[style.--reveal-delay.ms]': 'revealDelay()',
  },
})
export class RevealDirective {
  readonly revealDelay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduce || typeof IntersectionObserver === 'undefined') {
        el.classList.add('is-revealed');
        return;
      }
      // Already on screen (e.g. prerendered content that is painted before the app starts):
      // leave it visible instead of hiding it and fading it back in.
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) return;
      el.classList.add('is-armed');
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              el.classList.add('is-revealed');
              io.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
