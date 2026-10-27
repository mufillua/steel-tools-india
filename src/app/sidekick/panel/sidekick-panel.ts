import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../components/icon/icon';
import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { EnquiryService } from '../../services/enquiry.service';
import { ProductService } from '../../services/product.service';
import { ReplyAction, Suggestion } from '../engine/types';
import { SidekickMascot } from '../mascot/sidekick-mascot';
import { SidekickService } from '../sidekick.service';
import { SidekickState } from '../sidekick-state';

/** "**bold** text" → segments for the template (no innerHTML, so nothing in an answer can inject markup). */
interface Segment {
  text: string;
  bold: boolean;
}

/**
 * Sidekick's chat window. Desktop: a panel above the chat button. Phones: a full-screen sheet.
 * Loaded only after the visitor first opens the chat (see SidekickLauncher's @defer).
 */
@Component({
  selector: 'sti-sidekick-panel',
  imports: [Icon, RouterLink, SidekickMascot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidekick-panel.html',
  styleUrl: './sidekick-panel.scss',
  host: {
    '[class.is-open]': 'state.open()',
    '[attr.inert]': 'state.open() ? null : ""',
    '(keydown.escape)': 'close()',
  },
})
export class SidekickPanel {
  protected readonly state = inject(SidekickState);
  protected readonly chat = inject(SidekickService);
  private readonly enquiry = inject(EnquiryService);
  private readonly catalogue = inject(ProductService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly company = COMPANY;
  protected readonly draft = signal('');
  private readonly log = viewChild<ElementRef<HTMLElement>>('log');
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('field');

  /** Tap-to-ask chips come from the latest answer only. */
  protected readonly suggestions = computed<Suggestion[]>(() => {
    const list = this.chat.messages();
    const last = list[list.length - 1];
    return !this.chat.thinking() && last?.from === 'bot' ? (last.reply?.suggestions ?? []) : [];
  });

  constructor() {
    this.chat.start();

    // Keep the newest message in view.
    effect(() => {
      this.chat.messages();
      this.chat.thinking();
      untracked(() => queueMicrotask(() => this.scrollToEnd()));
    });

    // Focus the question box whenever the window opens; lock page scroll behind the full-screen sheet on phones.
    effect(() => {
      const open = this.state.open();
      untracked(() => {
        if (open) setTimeout(() => this.input()?.nativeElement.focus({ preventScroll: true }), 60);
        const phone = this.document.defaultView?.matchMedia('(max-width: 639.98px)').matches;
        this.document.body.classList.toggle('sti-scroll-locked', !!(open && phone));
      });
    });

    afterNextRender(() => this.scrollToEnd());
  }

  /**
   * Keeps the conversation in view: a new answer is scrolled to its first line (long answers are read top-down);
   * a question or the typing dots scroll to the very end.
   */
  private scrollToEnd(): void {
    const el = this.log()?.nativeElement;
    if (!el) return;
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = this.chat.messages();
    const answer = !this.chat.thinking() && list.length > 1 && list[list.length - 1].from === 'bot';
    const bots = el.querySelectorAll<HTMLElement>('.msg--bot');
    const last = answer ? bots[bots.length - 1] : null;
    const top = last && last.offsetHeight > el.clientHeight * 0.8 ? last.offsetTop - 10 : el.scrollHeight;
    el.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }

  protected send(event?: Event): void {
    event?.preventDefault();
    const text = (this.input()?.nativeElement.value ?? this.draft()).trim();
    // While an answer is on its way the question stays in the box, so nothing typed is lost.
    if (!text || this.chat.thinking()) return;
    this.draft.set('');
    if (this.input()) this.input()!.nativeElement.value = '';
    this.chat.ask(text);
  }

  protected ask(s: Suggestion): void {
    this.chat.ask(s.ask);
  }

  protected close(): void {
    this.state.hide();
    this.document.body.classList.remove('sti-scroll-locked');
    // Back to the chat button, so keyboard users don't lose their place.
    this.document.querySelector<HTMLElement>('.skl__btn')?.focus({ preventScroll: true });
  }

  protected segments(text: string): Segment[] {
    return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) =>
      part.startsWith('**') && part.endsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false },
    );
  }

  /** Links and buttons inside answers navigate on the site; on phones the sheet closes so the page is visible. */
  protected navigated(): void {
    if (this.document.defaultView?.matchMedia('(max-width: 639.98px)').matches) this.close();
  }

  protected actionHref(a: ReplyAction): string | null {
    switch (a.kind) {
      case 'whatsapp': {
        const product = a.slug ? this.catalogue.getProductBySlug(a.slug) : undefined;
        if (product) return this.enquiry.whatsappUrl(product, product.variants.find((v) => v.id === a.variantId) ?? null);
        const text = a.text ? `Hello ${COMPANY.name}, I have a question: ${a.text}` : `Hello ${COMPANY.name}, I have a question about your products.`;
        return `${COMPANY_LINKS.whatsapp}?text=${encodeURIComponent(text)}`;
      }
      case 'call':
        return COMPANY_LINKS.tel;
      case 'email':
        return COMPANY_LINKS.mailto;
      case 'map':
        return COMPANY_LINKS.mapsSearch;
      default:
        return null;
    }
  }

  protected go(a: ReplyAction): void {
    if (a.kind !== 'route') return;
    this.router.navigate([a.route], { queryParams: a.query });
    this.navigated();
  }

  protected restart(): void {
    this.chat.restart();
    this.input()?.nativeElement.focus({ preventScroll: true });
  }
}
