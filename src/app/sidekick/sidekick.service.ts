import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

import { COMPANY } from '../config/company.config';
import { CATEGORIES } from '../data/categories';
import { ProductService } from '../services/product.service';
import { SidekickEngine } from './engine/engine';
import { Reply, SidekickContext, SidekickKnowledge } from './engine/types';
import { MascotMood } from './mascot/sidekick-mascot';

export interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text?: string;
  reply?: Reply;
}

const STORE_KEY = 'sti-sidekick-v1';

/**
 * The conversation. Loads the catalogue and the trained knowledge file the first time the chat opens, then answers
 * every question locally with SidekickEngine — nothing leaves the visitor's browser.
 * The conversation is kept for the browser tab's session, so it survives moving between pages.
 */
@Injectable({ providedIn: 'root' })
export class SidekickService {
  private readonly catalogue = inject(ProductService);
  private readonly document = inject(DOCUMENT);

  readonly messages = signal<ChatMessage[]>([]);
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly thinking = signal(false);
  readonly mood = signal<MascotMood>('wave');

  private engine?: SidekickEngine;
  private context: SidekickContext = { products: [], turn: 0 };
  private nextId = 1;
  private starting?: Promise<void>;
  private moodTimer?: ReturnType<typeof setTimeout>;

  /** Prepares the engine (once). Safe to call repeatedly. */
  start(): Promise<void> {
    this.starting ??= this.boot();
    return this.starting;
  }

  private async boot(): Promise<void> {
    this.status.set('loading');
    try {
      const url = new URL('assets/sidekick/knowledge.json', this.document.baseURI).toString();
      const [knowledge] = await Promise.all([
        fetch(url).then((r) => {
          if (!r.ok) throw new Error(`knowledge.json: ${r.status}`);
          return r.json() as Promise<SidekickKnowledge>;
        }),
        this.catalogue.load(),
      ]);
      this.engine = new SidekickEngine(this.catalogue.products(), CATEGORIES, knowledge, {
        name: COMPANY.name,
        city: COMPANY.city,
        foundedYear: COMPANY.foundedYear,
        phoneDisplay: COMPANY.phoneDisplay,
        whatsappDisplay: COMPANY.whatsappDisplay,
        email: COMPANY.email,
        addressLines: COMPANY.address.lines,
        pincode: COMPANY.address.pincode,
        hours: COMPANY.hours,
        owner: COMPANY.owner,
      });
      if (!this.restore()) this.welcome();
      this.status.set('ready');
      this.setMood('wave', 2400);
    } catch {
      this.status.set('error');
      this.starting = undefined;
    }
  }

  private welcome(): void {
    this.context = { products: [], turn: 0 };
    this.messages.set([{ id: this.nextId++, from: 'bot', reply: this.engine!.welcome() }]);
  }

  ask(question: string): void {
    const text = question.trim().slice(0, 300);
    if (!text || !this.engine || this.thinking()) return;
    this.messages.update((list) => [...list, { id: this.nextId++, from: 'user', text }]);
    this.thinking.set(true);
    this.setMood('think');
    // A short, natural pause — the answer itself is instant.
    const delay = Math.min(900, 380 + text.length * 6);
    setTimeout(() => {
      const reply = this.engine!.answer(text, this.context);
      this.context = reply.context;
      this.messages.update((list) => [...list, { id: this.nextId++, from: 'bot', reply }]);
      this.thinking.set(false);
      this.setMood(reply.intent === 'unknown' || reply.intent === 'unlisted' ? 'idle' : 'happy', 1600);
      this.save();
    }, delay);
  }

  restart(): void {
    if (!this.engine) return;
    this.welcome();
    this.save();
    this.setMood('wave', 2400);
  }

  private setMood(mood: MascotMood, revertAfter = 0): void {
    clearTimeout(this.moodTimer);
    this.mood.set(mood);
    if (revertAfter) this.moodTimer = setTimeout(() => this.mood.set('idle'), revertAfter);
  }

  // ── Session storage (best effort: private windows may block it) ──

  private save(): void {
    try {
      const data = { messages: this.messages().slice(-40), context: this.context };
      this.document.defaultView?.sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — the chat still works for this page */
    }
  }

  private restore(): boolean {
    try {
      const raw = this.document.defaultView?.sessionStorage.getItem(STORE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as { messages: ChatMessage[]; context: SidekickContext };
      if (!Array.isArray(data.messages) || !data.messages.length) return false;
      this.messages.set(data.messages);
      this.context = data.context ?? { products: [], turn: 0 };
      this.nextId = Math.max(...data.messages.map((m) => m.id)) + 1;
      return true;
    } catch {
      return false;
    }
  }
}
