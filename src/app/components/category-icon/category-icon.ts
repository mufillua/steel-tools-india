import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CategoryIcon as CategoryIconName } from '../../models/category.model';

/**
 * Line-drawn technical illustrations for each category — drawn like engineering
 * sketches (outline + centre line in red), in a 64×64 box, currentColor strokes.
 */
@Component({
  selector: 'sti-category-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 0 64 64"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('taper') {
          <!-- BT taper holder: taper shank, flange, collet nose -->
          <line class="cl" x1="4" y1="32" x2="60" y2="32" />
          <path d="M8 26 L24 22 V42 L8 38 Z" />
          <path d="M24 18 H31 V46 H24 Z" />
          <path d="M26.5 18 V46 M28.5 18 V46" opacity=".45" />
          <path d="M31 24 H44 V40 H31" />
          <path d="M44 26 L54 27.5 V36.5 L44 38" />
          <path d="M54 29 H57 V35 H54" />
        }
        @case ('centre') {
          <!-- Revolving centre: Morse shank, bearing body, 60° point -->
          <line class="cl" x1="4" y1="32" x2="60" y2="32" />
          <path d="M6 28 L24 26.5 V37.5 L6 36 Z" />
          <path d="M24 22 H38 V42 H24 Z" />
          <path d="M28 22 V42 M34 22 V42" opacity=".45" />
          <path d="M38 25 H42 V39 H38" />
          <path d="M42 25 L58 32 L42 39" />
          <path d="M50 28.5 V35.5" opacity=".45" />
        }
        @case ('hand-tool') {
          <!-- Adjustable tap wrench -->
          <line class="cl" x1="32" y1="8" x2="32" y2="56" />
          <path d="M6 30 H24 V34 H6 Z" />
          <path d="M40 30 H58 V34 H40 Z" />
          <rect x="24" y="24" width="16" height="16" rx="1.5" />
          <path d="M28.5 28.5 H35.5 V35.5 H28.5 Z" />
          <path d="M4 30.5 V33.5 M60 30.5 V33.5" />
        }
        @case ('solid-carbide') {
          <!-- End mill: shank + helical flutes -->
          <line class="cl" x1="4" y1="32" x2="60" y2="32" />
          <path d="M6 25 H30 V39 H6 Z" />
          <path d="M30 26 H56 L58 28 V36 L56 38 H30" />
          <path d="M34 26 L40 38 M40 26 L46 38 M46 26 L52 38 M52 26 L56.5 35" />
        }
        @case ('indexable') {
          <!-- Face mill cutter with inserts -->
          <circle class="cl" cx="32" cy="32" r="18" />
          <circle cx="32" cy="32" r="22" />
          <circle cx="32" cy="32" r="7" />
          <path d="M30 32 H34 M32 30 V34" opacity=".6" />
          <path d="M28 8.8 L36 8.8 L36 14 L28 14 Z" />
          <path d="M28 50 L36 50 L36 55.2 L28 55.2 Z" />
          <path d="M8.8 28 V36 H14 V28 Z" />
          <path d="M50 28 V36 H55.2 V28 Z" />
        }
        @case ('hss') {
          <!-- Twist drill -->
          <line class="cl" x1="4" y1="32" x2="60" y2="32" />
          <path d="M6 27 H26 V37 H6 Z" />
          <path d="M26 27.5 H50 L58 32 L50 36.5 H26" />
          <path d="M29 27.5 C33 30, 33 34, 37 36.5 M37 27.5 C41 30, 41 34, 45 36.5 M45 27.5 C49 30, 49 34, 52 35.4" />
        }
        @case ('carbide-tipped') {
          <!-- Brazed turning tool: square shank + tip -->
          <line class="cl" x1="4" y1="36" x2="60" y2="36" />
          <path d="M6 30 H44 V42 H6 Z" />
          <path d="M6 30 L10 26 H48 L44 30" opacity=".6" />
          <path d="M44 30 L48 26 V38 L44 42" opacity=".6" />
          <path d="M44 30 L56 30 L58 34 L50 42 H44" />
          <path d="M50 30 L53 34" />
        }
        @case ('pliers') {
          <!-- Combination pliers: jaws, pivot, handles -->
          <line class="cl" x1="32" y1="4" x2="32" y2="60" />
          <path d="M28 8 L30 22 L34 22 L36 8 Q32 5 28 8 Z" />
          <circle cx="32" cy="26" r="4" />
          <path d="M29 29 L20 56 Q22 59 25 57 L31 31" />
          <path d="M35 29 L44 56 Q42 59 39 57 L33 31" />
          <path d="M30 14 H34 M30 18 H34" opacity=".5" />
        }
        @case ('spanner') {
          <!-- Double-ended open jaw spanner -->
          <line class="cl" x1="10" y1="54" x2="54" y2="10" />
          <path d="M20 44 L44 20" />
          <path d="M24 48 L48 24" />
          <path d="M44 20 L46 12 L52 8 L50 16 L56 14 L54 20 L48 24" />
          <path d="M20 44 L12 46 L8 52 L16 50 L14 56 L20 54 L24 48" />
        }
        @case ('socket') {
          <!-- Socket with square drive, hex bore -->
          <line class="cl" x1="32" y1="4" x2="32" y2="60" />
          <path d="M20 12 H44 V52 H20 Z" />
          <path d="M20 34 H44" opacity=".5" />
          <path d="M26 14 L38 14 L41 20 L38 26 L26 26 L23 20 Z" />
          <rect x="27" y="42" width="10" height="10" />
        }
        @case ('screwdriver') {
          <!-- Screwdriver: handle, blade, flat tip -->
          <line class="cl" x1="4" y1="32" x2="60" y2="32" />
          <path d="M6 26 H22 Q26 26 26 30 V34 Q26 38 22 38 H6 Q4 38 4 36 V28 Q4 26 6 26 Z" />
          <path d="M10 26 V38 M15 26 V38" opacity=".45" />
          <path d="M26 30.5 H52 V33.5 H26" />
          <path d="M52 30 L58 31 V33 L52 34" />
        }
        @case ('hammer') {
          <!-- Ball pein hammer -->
          <line class="cl" x1="32" y1="14" x2="32" y2="60" />
          <path d="M29 22 H35 V58 Q32 60 29 58 Z" />
          <path d="M14 10 H44 V22 H14 Z" />
          <path d="M44 12 H50 Q54 16 50 20 H44" />
          <path d="M14 12 L8 13 V19 L14 20" />
        }
        @case ('toolbox') {
          <!-- Cantilever tool box -->
          <path d="M8 28 H56 V54 H8 Z" />
          <path d="M8 36 H56" opacity=".5" />
          <path d="M14 28 L18 20 H46 L50 28" />
          <path d="M24 20 V14 H40 V20" />
          <rect x="28" y="40" width="8" height="4" />
          <line class="cl" x1="32" y1="8" x2="32" y2="58" />
        }
        @case ('disc') {
          <!-- Segmented diamond cutting disc -->
          <circle cx="32" cy="32" r="22" />
          <circle class="cl" cx="32" cy="32" r="16" />
          <circle cx="32" cy="32" r="5" />
          <path d="M32 10 V14 M32 50 V54 M10 32 H14 M50 32 H54 M16.4 16.4 L19.3 19.3 M44.7 44.7 L47.6 47.6 M16.4 47.6 L19.3 44.7 M44.7 19.3 L47.6 16.4" />
        }
        @case ('non-sparking') {
          <!-- Spanner with a struck-through spark -->
          <path d="M14 50 L38 26" />
          <path d="M18 54 L42 30" />
          <path d="M38 26 L40 18 L46 14 L44 22 L50 20 L48 26 L42 30" />
          <path d="M14 50 L8 52 L10 58 L18 54" />
          <path d="M48 44 L54 40 L51 48 L57 46" class="cl" />
          <line x1="44" y1="50" x2="60" y2="38" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; line-height: 0; }
    .cl { stroke: var(--sti-red-600); stroke-width: 1; stroke-dasharray: 6 2 1 2; opacity: .7; }
  `,
})
export class CategoryIcon {
  readonly name = input.required<CategoryIconName>();
  readonly size = input(56);
}
