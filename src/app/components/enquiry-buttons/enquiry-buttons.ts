import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Product, ProductVariant } from '../../models/product.model';
import { EnquiryService } from '../../services/enquiry.service';
import { Icon } from '../icon/icon';

type Size = 'sm' | 'md' | 'lg' | 'xl';
const SIZE_CLASS: Record<Size, string> = { sm: 'sti-btn--sm', md: '', lg: 'sti-btn--lg', xl: 'sti-btn--xl' };
const ICON_SIZE: Record<Size, number> = { sm: 15, md: 18, lg: 19, xl: 19 };

/**
 * WhatsApp enquiry button — opens WhatsApp with the product (and selected size) pre-filled.
 * Used on product cards, the product page panel and the sticky enquiry bar.
 */
@Component({
  selector: 'sti-whatsapp-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <a
      class="sti-btn sti-btn--whatsapp {{ sizeClass() }}"
      [class.sti-btn--block]="block()"
      [class.sti-btn--icon-mobile]="iconOnMobile()"
      [href]="href()"
      target="_blank"
      rel="noopener"
      [attr.aria-label]="ariaLabel()"
    >
      <sti-icon name="chat" [size]="iconSize()" /><span class="sti-btn__label">{{ label() }}</span>
    </a>
  `,
})
export class WhatsappButton {
  readonly product = input.required<Product>();
  readonly variant = input<ProductVariant | null>(null);
  readonly label = input('WhatsApp');
  readonly size = input<Size>('md');
  readonly block = input(false);
  /** Show only the icon on phones (the aria-label still names the action). */
  readonly iconOnMobile = input(false);

  private readonly enquiry = inject(EnquiryService);
  protected readonly href = computed(() => this.enquiry.whatsappUrl(this.product(), this.variant()));
  protected readonly sizeClass = computed(() => SIZE_CLASS[this.size()]);
  protected readonly iconSize = computed(() => ICON_SIZE[this.size()]);
  protected readonly ariaLabel = computed(
    () => `${this.label()}: ${this.product().name}${this.variant() ? `, ${this.variant()!.label}` : ''} (opens WhatsApp)`,
  );
}

/** Email enquiry button — opens the visitor's email app with subject and body pre-filled. */
@Component({
  selector: 'sti-email-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <a
      class="sti-btn sti-btn--outline {{ sizeClass() }}"
      [class.sti-btn--block]="block()"
      [class.sti-btn--icon-mobile]="iconOnMobile()"
      [href]="href()"
      [attr.aria-label]="ariaLabel()"
    >
      <sti-icon name="mail" [size]="iconSize()" /><span class="sti-btn__label">{{ label() }}</span>
    </a>
  `,
})
export class EmailButton {
  readonly product = input.required<Product>();
  readonly variant = input<ProductVariant | null>(null);
  readonly label = input('Email');
  readonly size = input<Size>('md');
  readonly block = input(false);
  /** Show only the icon on phones (the aria-label still names the action). */
  readonly iconOnMobile = input(false);

  private readonly enquiry = inject(EnquiryService);
  protected readonly href = computed(() => this.enquiry.emailUrl(this.product(), this.variant()));
  protected readonly sizeClass = computed(() => SIZE_CLASS[this.size()]);
  protected readonly iconSize = computed(() => ICON_SIZE[this.size()]);
  protected readonly ariaLabel = computed(
    () => `${this.label()}: ${this.product().name}${this.variant() ? `, ${this.variant()!.label}` : ''} (opens your email app)`,
  );
}
