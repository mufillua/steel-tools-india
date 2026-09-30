import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { COMPANY, COMPANY_LINKS } from '../../config/company.config';
import { EnquiryService, QuoteDetails } from '../../services/enquiry.service';
import { ProductService } from '../../services/product.service';
import { Icon } from '../icon/icon';
import { ProductImage } from '../product-image/product-image';

/** Optional phone: 10–15 digits once spaces, dashes, brackets and a leading + are ignored. */
function phoneValidator(c: AbstractControl<string>): ValidationErrors | null {
  const v = (c.value ?? '').trim();
  if (!v) return null;
  if (!/^[+\d][\d\s()-]*$/.test(v)) return { phone: true };
  const digits = v.replace(/\D/g, '').length;
  return digits >= 10 && digits <= 15 ? null : { phone: true };
}

type Channel = 'whatsapp' | 'email';

const FIELD_ORDER = ['name', 'phone', 'email', 'requirement', 'quantity', 'message'] as const;
const LABELS: Record<string, string> = {
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  requirement: 'Product / Requirement',
  quantity: 'Quantity',
  message: 'Message',
};

/**
 * Get A Quote form. There is no backend: "Send" opens WhatsApp or the visitor's email app with the
 * message filled in, and the form says so plainly. Product + size arrive from product pages
 * (?product=<slug>&variant=<id>) so nothing has to be typed twice.
 */
@Component({
  selector: 'sti-quote-form',
  imports: [ReactiveFormsModule, RouterLink, Icon, ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.scss',
})
export class QuoteForm {
  /** Product slug to attach (from ?product=). */
  readonly productSlug = input<string | null | undefined>(null);
  /** Variant id to preselect (from ?variant=). */
  readonly variantId = input<string | null | undefined>(null);
  /** Prefix for element ids, so two forms could share a page. */
  readonly idPrefix = input('qf');

  private readonly fb = inject(FormBuilder);
  private readonly enquiry = inject(EnquiryService);
  protected readonly catalogue = inject(ProductService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  protected readonly company = COMPANY;
  protected readonly links = COMPANY_LINKS;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    company: ['', Validators.maxLength(120)],
    phone: ['', phoneValidator],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    requirement: ['', Validators.maxLength(300)],
    quantity: ['', Validators.maxLength(60)],
    message: ['', Validators.maxLength(1500)],
  });
  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // ── Attached product / size ──────────────────────────────
  protected readonly attachedSlug = linkedSignal(() => this.productSlug() ?? null);
  protected readonly selectedVariantId = linkedSignal(() => this.variantId() ?? '');

  protected readonly product = computed(() => {
    const slug = this.attachedSlug();
    return slug ? (this.catalogue.getProductBySlug(slug) ?? null) : null;
  });
  protected readonly variant = computed(() => {
    const p = this.product();
    if (!p) return null;
    return p.variants.find((v) => v.id === this.selectedVariantId()) ?? (p.variants.length === 1 ? p.variants[0] : null);
  });
  /** A slug was passed but isn't in the catalogue. */
  protected readonly unknownProduct = computed(
    () => !!this.productSlug() && this.catalogue.status() === 'ready' && !this.product() && this.attachedSlug() !== null,
  );
  protected readonly productNames = computed(() => this.catalogue.products().map((p) => p.name));

  // ── Submit state ─────────────────────────────────────────
  protected readonly submitted = signal(false);
  protected readonly sent = signal<Channel | null>(null);
  protected readonly copied = signal(false);

  protected readonly details = computed<QuoteDetails>(() => ({
    ...this.form.getRawValue(),
    ...this.values(),
    product: this.product(),
    variant: this.variant(),
  }) as QuoteDetails);
  protected readonly preview = computed(() => this.enquiry.quoteMessage(this.details()));

  /** Needs a product attached, or something typed in Product / Requirement. */
  protected readonly missingRequirement = computed(
    () => !this.product() && !(this.values().requirement ?? '').trim(),
  );

  protected readonly errors = computed(() => {
    this.values(); // re-evaluate on every edit
    if (!this.submitted()) return [];
    const list: { id: string; text: string }[] = [];
    for (const key of FIELD_ORDER) {
      const msg = key === 'requirement' && this.missingRequirement() ? this.messageFor('requirement', 'required') : this.error(key);
      if (msg) list.push({ id: this.fieldId(key), text: msg });
    }
    return list;
  });

  constructor() {
    this.catalogue.load();
  }

  protected fieldId(key: string): string {
    return `${this.idPrefix()}-${key}`;
  }

  /** Error text for a field — only after a send attempt or once the field has been left. */
  protected error(key: (typeof FIELD_ORDER)[number]): string | null {
    const c = this.form.controls[key];
    if (key === 'requirement' && this.submitted() && this.missingRequirement()) return this.messageFor(key, 'required');
    if (!c.errors || !(this.submitted() || c.touched)) return null;
    return this.messageFor(key, Object.keys(c.errors)[0]);
  }

  private messageFor(key: string, kind: string): string {
    switch (kind) {
      case 'required':
        return key === 'requirement' ? 'Tell us which product or tool you need.' : `Please enter your ${LABELS[key].toLowerCase()}.`;
      case 'email':
        return 'Please enter a valid email address, e.g. name@company.com.';
      case 'phone':
        return 'Please enter a valid phone number (10–15 digits).';
      case 'maxlength':
        return `${LABELS[key]} is too long.`;
      default:
        return `Please check ${LABELS[key].toLowerCase()}.`;
    }
  }

  protected removeProduct(): void {
    this.attachedSlug.set(null);
    this.selectedVariantId.set('');
  }

  /** Picking an exact product name from the suggestions attaches that product. */
  protected onRequirementChange(value: string): void {
    if (this.product()) return;
    const match = this.catalogue.products().find((p) => p.name.toLowerCase() === value.trim().toLowerCase());
    if (match) {
      this.attachedSlug.set(match.slug);
      this.selectedVariantId.set('');
      this.form.controls.requirement.setValue('');
    }
  }

  protected send(channel: Channel): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.copied.set(false);

    if (this.form.invalid || this.missingRequirement()) {
      this.sent.set(null);
      // Focus the error summary so screen readers announce it, then the first bad field is one tab away.
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.qf-errors')?.focus(), {
        injector: this.injector,
      });
      return;
    }

    const url = channel === 'whatsapp' ? this.enquiry.quoteWhatsappUrl(this.details()) : this.enquiry.quoteEmailUrl(this.details());
    if (channel === 'whatsapp') {
      const win = this.document.defaultView?.open(url, '_blank', 'noopener');
      if (!win && this.document.defaultView) this.document.defaultView.location.href = url;
    } else if (this.document.defaultView) {
      this.document.defaultView.location.href = url;
    }
    this.sent.set(channel);
  }

  protected async copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.preview());
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }

  protected focusField(event: Event, id: string): void {
    event.preventDefault();
    this.document.getElementById(id)?.focus();
  }
}
