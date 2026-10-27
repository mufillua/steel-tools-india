/** Shapes shared by the Sidekick training script, the engine and the chat UI. */

/** What `npm run sidekick:train` writes to public/assets/sidekick/knowledge.json. */
export interface SidekickKnowledge {
  version: number;
  trainedAt: string;
  sources: { doc: string; title: string; pages: number; ocrPages: number; passages: number }[];
  /** General "where / how is it used" notes per product type (scripts/sidekick/tool-guide.json). */
  guides: Record<string, GuideEntry>;
  /** Product slug → guide id. */
  productGuide: Record<string, string>;
  /** Descriptive sentences from the catalogues (prices, contact details and the lifting maker's name removed). */
  passages: { t: string; d: string; p: number }[];
  /** Product slug → indexes into `passages`, best first. */
  productPassages: Record<string, number[]>;
  synonyms: { replace: [string, string][]; related: [string, string][]; jobs?: Record<string, string[]> };
}

export interface GuideEntry {
  title: string;
  uses: string;
  how: string[];
  tips?: string[];
}

/** The slice of company details the engine needs (from company.config.ts). */
export interface SidekickCompany {
  name: string;
  city: string;
  foundedYear: number;
  phoneDisplay: string;
  whatsappDisplay: string;
  email: string;
  addressLines: string[];
  pincode: string;
  hours: { label: string; opens: string | null; closes: string | null }[];
}

export interface ProductRef {
  slug: string;
  name: string;
  summary: string;
  brand: string;
  image: string | null;
  category: string;
}

export interface LinkItem {
  label: string;
  /** Site route, e.g. /categories/slings-lashing */
  route: string;
  meta?: string;
}

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'list'; title?: string; items: string[]; ordered?: boolean }
  | { kind: 'facts'; title?: string; rows: { label: string; value: string }[] }
  | { kind: 'sizes'; title: string; items: string[]; more: number; slug: string }
  | { kind: 'products'; items: ProductRef[] }
  | { kind: 'links'; title?: string; items: LinkItem[] }
  | { kind: 'note'; text: string };

/** A follow-up question the visitor can tap. */
export interface Suggestion {
  label: string;
  ask: string;
}

export type ReplyAction =
  /** `text` with a product: an extra line for the quote (e.g. the size needed). `request`: `text` is something to supply. */
  | { kind: 'whatsapp'; label: string; slug?: string; variantId?: string; text?: string; request?: boolean }
  | { kind: 'call'; label: string }
  | { kind: 'email'; label: string }
  | { kind: 'route'; label: string; route: string; query?: Record<string, string> }
  | { kind: 'map'; label: string };

export type Intent =
  | 'greeting'
  | 'thanks'
  | 'bye'
  | 'about'
  | 'help'
  | 'human'
  | 'price'
  | 'contact'
  | 'hours'
  | 'location'
  | 'order'
  | 'categories'
  | 'brand'
  | 'compare'
  | 'sizes'
  | 'uses'
  | 'howto'
  | 'specs'
  | 'availability'
  | 'info'
  /** Not listed exactly — the customer is sent to the team (and shown related products, if any). */
  | 'unlisted'
  | 'unknown';

/** What the engine remembers between turns, so "what sizes?" after "chain pulley block" works. */
export interface SidekickContext {
  products: string[];
  category?: string;
  turn: number;
}

export interface Reply {
  intent: Intent;
  blocks: Block[];
  suggestions: Suggestion[];
  actions: ReplyAction[];
  /** Slugs this reply is about (top first). */
  products: string[];
  context: SidekickContext;
}
