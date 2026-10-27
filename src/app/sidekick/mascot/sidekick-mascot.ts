import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MascotMood = 'idle' | 'wave' | 'think' | 'happy' | 'still';

let uid = 0;

/**
 * Sidekick — Steel Tools India's helper robot. An original drawing in the brand blues and red (rounded steel
 * helmet, LED eyes, hex-nut antenna and chest badge, holding an open-end spanner); pure SVG + CSS, no image file.
 *
 * Moods: idle (gentle hover + blink), wave (greeting), think (spanner turns, eyes look up while an answer is
 * prepared), happy (smiling eyes after answering), still (no animation loops — SVG animations repaint on the main
 * thread, so the button that is on every page stays still and just blinks now and then). Every loop stops for visitors who prefer reduced motion.
 */
@Component({
  selector: 'sti-sidekick-mascot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"mascot mascot--" + mood() + (blink() ? " is-blink" : "")',
    'aria-hidden': 'true',
  },
  template: `
    <svg [attr.viewBox]="crop() === 'head' ? '8 -2 104 88' : '0 0 120 140'" [attr.width]="size()" [attr.height]="crop() === 'head' ? size() * 88 / 104 : size() * 140 / 120" focusable="false">
      <defs>
        <linearGradient [attr.id]="id + 'head'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#dfe9f2" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'body'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3b67a3" />
          <stop offset="1" stop-color="#22457a" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'face'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1f3a63" />
          <stop offset="1" stop-color="#142844" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'steel'" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#d7dee5" />
          <stop offset="0.5" stop-color="#aab6c2" />
          <stop offset="1" stop-color="#8b98a6" />
        </linearGradient>
        <mask [attr.id]="id + 'jaw'">
          <rect x="-12" y="-40" width="24" height="60" fill="#fff" />
          <rect x="-3.6" y="-36" width="7.2" height="11" rx="1" fill="#000" />
        </mask>
      </defs>

      @if (crop() === 'full') {
        <ellipse class="mascot__shadow" cx="60" cy="133" rx="23" ry="4.2" />
      }

      <g class="mascot__bot">
        <!-- antenna with a hex-nut tip -->
        <line x1="60" y1="21" x2="60" y2="11" stroke="#8eabc5" stroke-width="3" stroke-linecap="round" />
        <circle class="mascot__glow" cx="60" cy="8.5" r="8" fill="#ee6f78" />
        <polygon points="60,3 64.8,5.75 64.8,11.25 60,14 55.2,11.25 55.2,5.75" fill="#de343f" />
        <circle cx="60" cy="8.5" r="1.8" fill="#fbe5e7" />

        <!-- bolt-head ears -->
        <g fill="#43689e">
          <polygon points="21,43 26.2,46 26.2,52 21,55 15.8,52 15.8,46" />
          <polygon points="99,43 104.2,46 104.2,52 99,55 93.8,52 93.8,46" />
        </g>
        <circle cx="21" cy="49" r="2" fill="#c9dbe9" />
        <circle cx="99" cy="49" r="2" fill="#c9dbe9" />

        <!-- helmet and face screen -->
        <rect x="24" y="20" width="72" height="58" rx="24" [attr.fill]="'url(#' + id + 'head)'" stroke="#c9dbe9" stroke-width="1.5" />
        <rect x="32" y="29" width="56" height="39" rx="15" [attr.fill]="'url(#' + id + 'face)'" />
        <path d="M38 35 q6 -3.5 14 -3.5" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2.4" stroke-linecap="round" fill="none" />

        <g class="mascot__eyes">
          <g class="mascot__eye mascot__eye--l"><circle cx="48" cy="47" r="6.4" fill="#9ad7ff" /><circle cx="50" cy="44.8" r="1.8" fill="#fff" /></g>
          <g class="mascot__eye mascot__eye--r"><circle cx="72" cy="47" r="6.4" fill="#9ad7ff" /><circle cx="74" cy="44.8" r="1.8" fill="#fff" /></g>
        </g>
        <g class="mascot__joy" fill="none" stroke="#9ad7ff" stroke-width="3.2" stroke-linecap="round">
          <path d="M42.5 49 q5.5 -7 11 0" />
          <path d="M66.5 49 q5.5 -7 11 0" />
        </g>
        <path class="mascot__mouth" d="M53 58.5 q7 5 14 0" fill="none" stroke="#9ad7ff" stroke-width="2.6" stroke-linecap="round" />

        @if (crop() === 'full') {
        <!-- neck and body -->
        <rect x="52" y="77" width="16" height="7" rx="2" fill="#aec4d8" />
        <path d="M40 84 h40 a8 8 0 0 1 7.8 9.6 l-5 23 a7 7 0 0 1 -6.8 5.4 h-31.9 a7 7 0 0 1 -6.8 -5.4 l-5 -23 A8 8 0 0 1 40 84z" [attr.fill]="'url(#' + id + 'body)'" />
        <rect x="46" y="91" width="28" height="21" rx="7" fill="#f1f6fa" />
        <polygon points="60,94.6 65.1,97.55 65.1,103.45 60,106.4 54.9,103.45 54.9,97.55" fill="none" stroke="#cf2f3a" stroke-width="2.6" stroke-linejoin="round" />
        <circle cx="60" cy="100.5" r="2.2" fill="#cf2f3a" />

        <!-- left arm holding an open-end spanner -->
        <g class="mascot__tool-arm">
          <path d="M36 90 q-9 4 -13 14" stroke="#2d5690" stroke-width="8" stroke-linecap="round" fill="none" />
          <g class="mascot__spanner">
            <g transform="translate(21 107) rotate(-28)">
              <g [attr.mask]="'url(#' + id + 'jaw)'">
                <rect x="-2.8" y="-26" width="5.6" height="32" rx="2.8" [attr.fill]="'url(#' + id + 'steel)'" />
                <circle cx="0" cy="-28" r="8.2" [attr.fill]="'url(#' + id + 'steel)'" />
              </g>
            </g>
          </g>
          <circle cx="21.5" cy="106.5" r="6.2" fill="#ffffff" stroke="#c9dbe9" stroke-width="1.2" />
        </g>

        <!-- right arm (waves) -->
        <g class="mascot__wave-arm">
          <path d="M84 90 q10 -3 14 -14" stroke="#2d5690" stroke-width="8" stroke-linecap="round" fill="none" />
          <circle cx="99" cy="74" r="6.2" fill="#ffffff" stroke="#c9dbe9" stroke-width="1.2" />
        </g>
        }
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    svg {
      overflow: visible;
      display: block;
    }
    .mascot__shadow {
      fill: #17263a;
      opacity: 0.16;
      transform-origin: 60px 133px;
      animation: sk-shadow 3.4s ease-in-out infinite;
    }
    .mascot__bot {
      animation: sk-float 3.4s ease-in-out infinite;
    }
    .mascot__glow {
      opacity: 0.35;
      transform-origin: 60px 8.5px;
      animation: sk-glow 2.4s ease-in-out infinite;
    }
    .mascot__eye {
      transform-box: fill-box;
      transform-origin: center;
      animation: sk-blink 5.2s infinite;
    }
    .mascot__eyes {
      transition: transform 0.35s ease;
    }
    .mascot__joy {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .mascot__wave-arm {
      transform-origin: 84px 90px;
      transition: transform 0.4s ease;
    }
    .mascot__spanner {
      transform-origin: 21px 107px;
    }

    /* Moods */
    :host(.mascot--wave) .mascot__wave-arm {
      animation: sk-wave 1.1s ease-in-out 2;
    }
    :host(.mascot--think) .mascot__spanner {
      animation: sk-turn 0.9s ease-in-out infinite;
    }
    :host(.mascot--think) .mascot__eyes {
      transform: translate(2px, -2.5px);
    }
    :host(.mascot--think) .mascot__glow {
      animation-duration: 0.8s;
    }
    :host(.mascot--happy) .mascot__eyes {
      opacity: 0;
    }
    :host(.mascot--happy) .mascot__joy {
      opacity: 1;
    }

    @keyframes sk-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3.5px); }
    }
    @keyframes sk-shadow {
      0%, 100% { transform: scale(1); opacity: 0.16; }
      50% { transform: scale(0.86); opacity: 0.1; }
    }
    @keyframes sk-glow {
      0%, 100% { transform: scale(0.75); opacity: 0.15; }
      50% { transform: scale(1.15); opacity: 0.45; }
    }
    @keyframes sk-blink {
      0%, 93%, 100% { transform: scaleY(1); }
      95.5% { transform: scaleY(0.1); }
    }
    @keyframes sk-wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-16deg); }
      75% { transform: rotate(12deg); }
    }
    @keyframes sk-turn {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-24deg); }
    }

    /* still: no loops at all (the always-visible chat button) — it only blinks when told to */
    :host(.mascot--still) .mascot__bot,
    :host(.mascot--still) .mascot__glow,
    :host(.mascot--still) .mascot__eye {
      animation: none;
    }
    :host(.is-blink) .mascot__eye {
      transform: scaleY(0.1);
      transition: transform 0.08s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .mascot__bot,
      .mascot__shadow,
      .mascot__glow,
      .mascot__eye,
      :host(.mascot--wave) .mascot__wave-arm,
      :host(.mascot--think) .mascot__spanner {
        animation: none !important;
      }
    }
  `,
})
export class SidekickMascot {
  readonly mood = input<MascotMood>('idle');
  /** Closes the eyes while true (used for the still mascot's occasional blink). */
  readonly blink = input(false);
  /** Rendered width in px (height follows the drawing). */
  readonly size = input(56);
  /** 'head' shows just the helmet — for small spaces like the chat button. */
  readonly crop = input<'full' | 'head'>('full');
  /** Unique gradient / mask ids — several mascots can be on the page at once. */
  protected readonly id = `sk${++uid}-`;
}
