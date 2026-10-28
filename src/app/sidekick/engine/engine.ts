import { Category } from '../../models/category.model';
import { Product, ProductVariant } from '../../models/product.model';
import { correctWord, SearchHit, SearchIndex } from './search';
import { devanagariToLatin, hasDevanagari, listText, looseHinglish, normalize, SizeToken, sizeTokens, stem, STOP_WORDS } from './text';
import {
  Block,
  GuideEntry,
  Intent,
  ProductRef,
  Reply,
  ReplyAction,
  SidekickCompany,
  SidekickContext,
  SidekickKnowledge,
  Suggestion,
} from './types';

/**
 * Sidekick's answer engine. Everything runs in the visitor's browser from two inputs: the site's product catalogue
 * (already curated from the supplier PDFs — no prices) and the trained knowledge file (tool guide, catalogue
 * passages, synonyms). No external service is called, nothing is generated freely: every sentence is either
 * catalogue data or a prepared template, so answers cannot invent sizes, prices or brands.
 */

// ── Intent patterns (tested on the normalised question) ────────────────────────────────────────────────────────
const RX: Record<string, RegExp> = {
  greeting: /^(hi+|hello+|hey+|hii+|helo|namaste|namaskar|good (morning|afternoon|evening)|hola|salaam|assalam\w*)\b/,
  thanks: /\b(thank|thanks|thanku|thankyou|thx|dhanyavad|dhanyawad|shukriya)\b/,
  bye: /^(bye|goodbye|see you|tata|good night|ok bye)\b/,
  about: /\b(who are you|your name|what are you|are you (a )?(bot|robot|human|real|ai)|who made you|sidekick)\b/,
  owner:
    /\b(owner|owners|proprietor|propriter|proprieter|malik|maalik|founder|founders|founded by|started by|who (started|founded|runs|owns|manages|heads)|run by|owned by|managed by|ceo|managing director|your boss|the boss|in ?charge)\b/,
  company:
    /\b(about (your|the|this) (company|business|firm|shop|store|organi[sz]ation)|(your|the|this) (company|business|firm|organi[sz]ation)|company (details|profile|info|information|history|background)|tell me about (you guys|yourselves|your (company|business|firm|shop))|who are you guys|history|established|establishment|founded|since when|how old (are you|is (your|the|this) (company|business|shop|firm|store))|how long (have you|has (it|the (company|business|shop))|are you in|have you been)|years (in|of) (business|experience|service)|(your|how much|years of) experience|background|legacy|family business|kab se|kitne saal|(do|did) you (make|manufacture|produce)|you manufacture|manufacturer or (dealer|supplier|trader)|(dealer|supplier|trader) or (a )?manufacturer|your (own )?(factory|manufacturing)|are you (a |an )?(dealer|distributor|retailer|wholesaler|stockist|trader|supplier|manufacturer|company)|authori[sz]ed|which brands|what brands|brands (do )?you|your brands|how many (products|items|categories|tools|sizes))\b/,
  help: /^(help|menu|start|options)\b|\bwhat can you (do|answer|help)\b|\bhow (does|do) (this|you) work\b/,
  human: /\b(talk|speak|chat|connect) (to|with) (a |an |the )?(human|person|someone|agent|executive|owner|team|staff|sales|real)\b|\b(call me|call back|callback|representative|customer care|customer service)\b/,
  price:
    /\b(price|prices|pricing|priced|rate|rates|cost|costs|costing|mrp|cheap|cheapest|discount|daam|dam|kimat|keemat|kitne|kitna|quotation|quote|budget|expensive|rupees?|rs)\b|\bhow much\b(?! (weight|load|capacity|can|does it (weigh|lift)|lift))/,
  contact: /\b(contact|phone|mobile|whatsapp|email|e mail|reach you|call you|get in touch|your number|contact number|phone number)\b/,
  hours: /\b(timing|timings|hours|opening|closing|closed|open|tomorrow|working days|holiday|holidays|what time|sunday|saturday|monday|tuesday|wednesday|thursday|friday|weekend)\b/,
  location:
    /\b(address|location|located|where are you|where is (your|the) (shop|store|office)|your shop|your store|your office|visit|directions|map|near me|nearby|come to)\b|\bwhere\b.*\b(shop|store|office)\b|\b(shop|store|office)\b.*\bwhere\b/,
  order: /\b(order|ordering|buy|purchase|deliver|delivery|shipping|ship|courier|dispatch|payment|pay|cod|gst|invoice|bulk|wholesale|minimum|moq|return|refund|warranty|guarantee|credit)\b/,
  categories: /\b(categories|category list|what (do|all) (you|u) (sell|have|stock|deal in)|what (products|items|tools) do you|product list|catalog|catalogue|full range|all products|what do you sell|what all)\b/,
  compare: /\b(difference|differences|differ|vs|versus|compare|comparison|which is better|better than)\b/,
  howto:
    /\bhow (to|do|does|can|should|would|is) (i |we |you |one |it )?(use|used|fit|fix|mount|install|operate|tighten|loosen|remove|change|adjust|set|attach|work|handle|lift|maintain|clean|sharpen|select|choose)\b|\b(procedure|steps|instructions|instruction|operate|operating|installation|how it works|how to)\b|\bhow (use|fit|install|operate|tighten|loosen)\b/,
  uses: /\b(use|uses|used|usage|purpose|application|applications|meaning|function|for what|kis liye|kaam|good for|suitable|what is|what are|whats|what s|what does)\b/,
  sizes: /\b(size|sizes|sizing|dimension|dimensions|diameter|dia|length|lengths|range|variants?|models?|available in|which sizes|how big|how long|capacity|capacities|tonnage|ton|tons)\b/,
  specs: /\b(spec|specs|specification|specifications|weight|weigh|material|standard|grade|hardness|coating|helix|flutes?|features?|technical|details|tolerance|wll|swl|load|thickness|height|width)\b/,
  availability:
    /\b(do you (have|sell|stock|deal|keep|supply|carry)|have you got|is there|available|availability|in stock|stock|milega|milta|mil jayega|chahiye|supply|supplier|dealer of|deal in|you have)\b/,
};

/** Words that describe the question rather than the product; removed before searching. */
const QUESTION_WORDS = new Set(
  (
    'size sizes sizing dimension dimensions diameter dia length lengths range variant variants model models available ' +
    'availability stock price prices rate rates cost costs mrp quote quotation use uses used usage purpose application ' +
    'applications work works working function how what which whats difference differences compare comparison vs versus better ' +
    'spec specs specification specifications weight weigh material standard feature features detail details technical ' +
    'procedure step steps instruction instructions operate operating operation install installation fit mount tighten ' +
    'loosen remove adjust buy order deliver delivery supply supplier dealer sell milega milta chahiye meaning suitable ' +
    'good best type types kind info information know product products item items list all can does done one ones ' +
    'mm inch kg t cm capacity capacities load tonnage big long many much help tell show between both explain ' +
    'kis liye kaam daam kitna kitne wala listed carry keep catalogue catalog ' +
    // business and small-talk words — answered by their own replies, never searched as products
    'timing timings hour hours open opening closing closed today now time address location located shop store office ' +
    'visit direction directions map near nearby phone mobile number contact whatsapp email mail call reach touch ' +
    'thank thanks thanku thankyou thx bye goodbye hello hey hii namaste name bot robot human person agent team staff ' +
    'talk speak sidekick who are you deliver delivery shipping courier payment pay gst invoice bulk wholesale return ' +
    'warranty guarantee credit cheap discount rupee rupees expensive budget sell selling sale tool tools ' +
    'sunday saturday monday tuesday wednesday thursday friday weekend holiday holidays tomorrow kolkata calcutta howrah bengal india ' +
    'something anything thing things need needed require required want ' +
    // "what brand is the torque wrench", "who makes the ER collet" — the product answer shows its brand
    'brand brands make makes made maker manufacturer manufacturers company'
  ).split(' '),
);

const PRONOUN = /\b(it|this|that|these|those|them|same|its|one|ones)\b/;
const MAKER = /\bsa\s?f\s?[eo]?\s?l?\s?[lo]?\s?l?\s?i\s?f\s?t(?!\s?ing)[a-z]*|\bsaif\b/gi;
const MAKER_TEST = new RegExp(MAKER.source, 'i');
const BRANDS: { re: RegExp; name: string }[] = [
  { re: /\btaparia\b/, name: 'Taparia' },
  { re: /\b(miranda|dormer)\b/, name: 'Miranda' },
  { re: /\b(rr|r r|rr brand)\b/, name: 'R★R Brand' },
];

/** How each trade from synonyms.json `jobs` is named in a sentence. */
const JOB_LABEL: Record<string, string> = {
  electrician: 'electrical work', electrical: 'electrical work', plumber: 'plumbing', plumbing: 'plumbing',
  carpenter: 'carpentry', carpentry: 'carpentry', mechanic: 'vehicle and machine repair', automobile: 'vehicle repair',
  fitter: 'fitting work', machinist: 'machining', cnc: 'CNC machining', lathe: 'lathe work', welder: 'welding work',
  fabrication: 'fabrication', warehouse: 'warehouse handling', godown: 'godown handling', rigging: 'rigging',
  crane: 'crane lifting', construction: 'construction sites', refinery: 'refineries and hazardous areas', home: 'home use',
};

/** Short display name: "Chain Pulley Block (B Series)" → "Chain Pulley Block". */
// "Welding machine", "spanner set": these words alone don't say what kind of item is wanted.
const GENERIC_HEADS = new Set(['machine', 'set', 'kit', 'tool', 'equipment', 'item', 'product', 'accessory', 'accessori', 'part', 'spare', 'unit', 'type', 'model']);
const UNITS = new Set(['mm', 'cm', 'm', 'inch', 't', 'kg', 'g', 'gm', 'ton', 'tonne', 'ft', 'feet', 'metre', 'meter', 'ltr', 'l', 'bar', 'psi', 'nm']);

/** "Do you have a vernier caliper?" → "vernier caliper" — the customer's request, for the WhatsApp message. */
export function requestText(question: string): string {
  return question
    .trim()
    .replace(/^(hi|hello|hey|sir|dear)\b[\s,!.]*/i, '')
    .replace(/^(do|does|can|could|will|would)\s+(you|u|ya)\s+(guys\s+|people\s+)?(have|sell|stock|supply|keep|carry|deal in|get|provide|make|arrange)\s+/i, '')
    .replace(/^(i|we)\s*(need|want|require|am looking for|'?m looking for|are looking for)\s+/i, '')
    .replace(/^(is|are)\s+there\s+/i, '')
    .replace(/^(have you got|got)\s+/i, '')
    .replace(/^(a|an|any|some)\s+/i, '')
    .replace(/\s*(available|in stock)?\s*[?.!]*$/i, '')
    .trim() || question.trim();
}

// Words that, next to the company's name, still mean "tell me about the company" ("about Steel Tools India").
const COMPANY_WORDS = new Set(['about', 'company', 'business', 'firm', 'yourself', 'yourselves', 'introduce', 'introduction', 'profile', 'details', 'detail', 'me', 'us', 'please', 'pls', 'is', 'the']);

const shortName = (name: string) => name.replace(/\s*[(—–-]\s.*$/, '').replace(/\s*\(.*$/, '').trim() || name;

export class SidekickEngine {
  private readonly bySlug = new Map<string, Product>();
  private readonly index: SearchIndex;
  private readonly catIndex: SearchIndex;
  private readonly vocabulary: Map<string, number>;
  private readonly replacements: [string, string][];
  /** Hindi phrases in English letters, indexed by their first word (loose spelling), longest first. */
  private readonly hindiPhrases = new Map<string, [string[], string][]>();
  /** Devanagari words → Hinglish. */
  private readonly devanagari = new Map<string, string>();
  private readonly related = new Map<string, string[]>();
  private readonly categories: (Category & { count: number })[];
  /** Share of the question's words the best product matched (below 1 = a close match, not an exact one). */
  private lastCoverage = 1;
  /** The question as typed, for WhatsApp messages. */
  private lastQuestion = '';

  constructor(
    products: Product[],
    categories: Category[],
    private readonly knowledge: SidekickKnowledge,
    private readonly company: SidekickCompany,
  ) {
    for (const p of products) this.bySlug.set(p.slug, p);
    this.categories = categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.slug).length }));

    this.index = new SearchIndex(
      products.map((p) => {
        const guide = this.guideFor(p);
        const cat = categories.find((c) => c.slug === p.category);
        const specValues = p.specifications.filter((s) => s.label !== 'Feature' && s.label !== 'Safe use').map((s) => s.value);
        const features = p.specifications.filter((s) => s.label === 'Feature').map((s) => s.value);
        // Codes from the size table ("er32", "bt40", "hpw08"); plain numbers are matched separately as sizes.
        const codes = new Set<string>();
        for (const v of p.variants) for (const w of normalize(v.label).split(' ')) if (/[a-z]/.test(w) && w.length > 1) codes.add(w);
        return {
          id: p.slug,
          fields: [
            { text: p.name, weight: 5 },
            { text: p.brand, weight: 2 },
            { text: p.subcategory, weight: 3 },
            { text: cat?.name ?? '', weight: 1.5 },
            { text: guide?.title ?? '', weight: 2.5 },
            { text: p.standard ?? '', weight: 1 },
            { text: p.summary, weight: 1 },
            { text: p.description, weight: 0.6 },
            { text: specValues.join(' '), weight: 0.5 },
            { text: features.join(' '), weight: 0.25 },
            { text: [...codes].join(' '), weight: 0.8 },
          ],
          phrases: [
            { text: normalize(p.name), bonus: 7 },
            { text: normalize(shortName(p.name)), bonus: 4 },
            { text: normalize(p.subcategory).replace(/s$/, ''), bonus: 1.5 },
            { text: normalize(shortName(guide?.title ?? '')), bonus: 2.5 },
          ].filter((x) => x.text.split(' ').length >= 2 || x.text.length >= 6),
        };
      }),
    );
    this.catIndex = new SearchIndex(
      categories.map((c) => ({
        id: c.slug,
        fields: [
          { text: c.name, weight: 4 },
          { text: c.highlights?.join(' ') ?? '', weight: 1 },
          { text: c.description, weight: 0.6 },
        ],
        phrases: [{ text: normalize(c.name), bonus: 8 }],
      })),
    );

    this.vocabulary = this.index.vocabulary;
    for (const w of QUESTION_WORDS) this.vocabulary.set(w, this.vocabulary.get(w) ?? 1);
    for (const [from, to] of knowledge.synonyms.hindi ?? []) {
      if (hasDevanagari(from)) {
        this.devanagari.set(from.normalize('NFC'), to);
        continue;
      }
      const words = normalize(from).split(' ').map(looseHinglish);
      const list = this.hindiPhrases.get(words[0]) ?? [];
      list.push([words, to]);
      this.hindiPhrases.set(words[0], list);
    }
    for (const list of this.hindiPhrases.values()) list.sort((a, b) => b[0].length - a[0].length);

    this.replacements = knowledge.synonyms.replace
      .map(([from, to]) => [normalize(from), normalize(to)] as [string, string])
      .filter(([from]) => from)
      .sort((a, b) => b[0].length - a[0].length);
    for (const [word, extra] of knowledge.synonyms.related) {
      this.related.set(normalize(word), normalize(extra).split(' ').map(stem));
    }
  }

  // ── Public ───────────────────────────────────────────────────────────────────────────────────────────────────

  /** Opening message shown when the chat is first opened. */
  welcome(): Reply {
    return this.reply('greeting', [
      { kind: 'text', text: `Hi! I'm Sidekick, ${this.company.name}'s product helper.` },
      {
        kind: 'text',
        text: 'Ask me about any tool in our catalogue — what it is used for, how to use it, which sizes we list, or where to find it on the site.',
      },
    ], this.starterSuggestions(), [], [], { products: [], turn: 0 });
  }

  answer(question: string, previous: SidekickContext = { products: [], turn: 0 }): Reply {
    const raw = (question ?? '').trim();
    const ctx: SidekickContext = { ...previous, turn: previous.turn + 1 };
    if (!raw) return this.welcome();
    this.lastQuestion = raw;

    // Hindi — Devanagari or English letters — is turned into the English the rest of Sidekick understands.
    const norm = this.hindiToEnglish(normalize(this.fromDevanagari(raw).replace(MAKER, ' lifting ')));
    const intents = Object.keys(RX).filter((k) => RX[k].test(norm)) as Intent[];
    const has = (i: Intent) => intents.includes(i);
    const asksAboutLiftingMaker = MAKER_TEST.test(raw);

    // Search words: the question minus question-words, with customer terms rewritten to catalogue terms.
    const { terms, extra, phrase, sizes } = this.searchTerms(norm);
    const brand = BRANDS.find((b) => b.re.test(norm))?.name;
    const contentTerms = terms.filter((t) => !BRANDS.some((b) => b.re.test(t)));

    // 1 · Small talk with no product in it.
    if (!contentTerms.length && !sizes.length) {
      if (has('human')) return this.humanReply(ctx);
      if (has('thanks')) return this.simple('thanks', `You're welcome! Ask me anything else about our tools — or message the team on WhatsApp for a quote.`, ctx);
      if (has('bye')) return this.simple('bye', `Thanks for visiting ${this.company.name}. Have a good day!`, ctx);
      if (has('about')) return this.aboutReply(ctx);
      if (has('help')) return this.helpReply(ctx);
      if (has('greeting') && !ctx.products.length) return this.greetingReply(ctx);
    }

    // 2 · Business questions (also answered when a product is mentioned alongside).
    if (has('human')) return this.humanReply(ctx);
    // The company and its owner — answered from the company settings (the same facts as the About page).
    if (has('owner') || this.namesOwner(norm)) return this.ownerReply(norm, ctx);
    if (has('company') || this.onlyCompanyName(norm)) return this.companyReply(norm, ctx);
    if (has('hours') && !contentTerms.length) return this.hoursReply(ctx);
    if ((has('location') || has('contact')) && !contentTerms.length) return this.contactReply(ctx, has('location'));
    if (brand && !contentTerms.length && !sizes.length) return this.brandReply(brand, ctx);
    if (has('order') && !has('price')) return this.orderReply(ctx, this.resolveProducts(terms, extra, phrase, ctx, norm).slice(0, 1));
    if (has('categories') && !contentTerms.length) return this.categoriesReply(ctx);
    if (asksAboutLiftingMaker && contentTerms.every((t) => t === 'lift')) return this.categoryReply('hoists-pulley-blocks', ctx, true);
    // "Tools for an electrician / plumber / warehouse" — a set of products for that trade.
    const job = this.jobFor(norm, contentTerms);
    if (job) return this.jobReply(job, ctx);
    if (brand && !contentTerms.length && !sizes.length) return this.brandReply(brand, ctx);

    // 3 · Comparisons: "difference between dead centre and revolving centre".
    if (has('compare')) {
      const pair = this.comparePair(norm);
      if (pair) return this.compareReply(pair[0], pair[1], ctx);
    }

    // 4 · Find the product(s) the question is about.
    let found = this.resolveProducts(terms, extra, phrase, ctx, norm, brand);
    // Follow-ups ("what sizes?", "how to use it") use the products from the previous answer — but only when the
    // question names nothing new of its own, or says "it" / "this".
    const usesContext = !found.length && ctx.products.length > 0 && (!contentTerms.length || PRONOUN.test(norm));
    if (usesContext) found = ctx.products.map((s) => this.bySlug.get(s)).filter((p): p is Product => !!p);

    // A whole category named ("lifting equipment", "hand tools") is answered with the category page.
    let viaCategory = false;
    if (!usesContext) {
      const cat = this.categoryMatch(contentTerms, phrase, found);
      if (cat && (has('uses') || has('howto'))) {
        // "What are non-sparking tools used for?" — answer with the category's product type.
        const inCat = found.filter((p) => p.category === cat);
        found = inCat.length ? inCat : [...this.bySlug.values()].filter((p) => p.category === cat).slice(0, 4);
        viaCategory = true;
      } else if (cat) {
        return this.categoryReply(cat, ctx);
      }
    }

    const item = this.itemTerms(norm, contentTerms);
    if (!found.length) {
      if (has('price')) return this.priceReply([], ctx);
      if (has('greeting')) return this.greetingReply(ctx);
      return this.unknownReply(raw, terms, extra, phrase, item, ctx);
    }

    // Not an exact match. Sidekick never tells a customer "we don't have it" — the team can often arrange it — and
    // only offers products that are the same kind of item (a vernier caliper → calipers; never an angle grinder →
    // socket accessories). Questions about uses, sizes etc. carry on with those related products.
    // (The search ignores very common words like "machine" when scoring, so exactness is also checked word by word
    // against the product's own data: "welding machine" is not a weld-on hook.)
    const whole = usesContext || viaCategory ? -1 : found.findIndex((p) => item.some((alt) => alt.length > 0 && alt.every((t) => this.mentions(p, t))));
    // A strong match that has every word asked for goes first ("ER collet set" → the set, not the single collet).
    if (whole > 0) found = [found[whole], ...found.filter((_, i) => i !== whole)];
    const exact = this.lastCoverage >= 1 && whole >= 0;
    if (!usesContext && !viaCategory && !exact) {
      const related = this.sameKind(found, item);
      const detail = has('howto') || has('uses') || has('sizes') || has('specs') || has('price') || sizes.length > 0;
      if (!related.length || !detail) return this.unlistedReply(related, ctx);
      found = related;
    }

    if (usesContext) this.lastCoverage = 1;
    const top = found[0];
    ctx.products = found.map((p) => p.slug);
    ctx.category = top.category;

    if (has('price')) return this.priceReply(found, ctx, sizes);
    if (has('howto')) return this.howToReply(found, ctx);
    if (has('sizes') || (sizes.length && top.variants.length)) {
      if (has('specs') && sizes.length) return this.specsReply(found, ctx, sizes);
      return this.sizesReply(found, ctx, sizes);
    }
    if (has('specs')) return this.specsReply(found, ctx, sizes);
    if (has('uses')) return this.usesReply(found, ctx);
    if (has('availability')) return this.availabilityReply(found, ctx, sizes);
    return this.infoReply(found, ctx);
  }

  // ── Understanding the question ───────────────────────────────────────────────────────────────────────────────

  /** Devanagari words → Hinglish: known words from the Hindi list, the rest spelt out in English letters. */
  private fromDevanagari(raw: string): string {
    if (!hasDevanagari(raw)) return raw;
    return raw
      .normalize('NFC')
      .replace(/[\u0964\u0965]/g, ' ') // danda
      .split(/\s+/)
      .map((token) => {
        const core = token.replace(/^[^\u0900-\u097F\w]+|[^\u0900-\u097F\w]+$/g, '');
        if (!hasDevanagari(core)) return token;
        return this.devanagari.get(core) ?? devanagariToLatin(core);
      })
      .join(' ');
  }

  /**
   * Hindi typed in English letters → English, longest phrase first, in one pass: "aapki dukaan kaha hai" → "your
   * shop where", "torque wrench kaise use kare" → "torque wrench how to use". Filler words are dropped.
   */
  private hindiToEnglish(norm: string): string {
    if (!this.hindiPhrases.size || !norm) return norm;
    const words = norm.split(' ');
    const keys = words.map(looseHinglish);
    const out: string[] = [];
    for (let i = 0; i < words.length; ) {
      const hit = (this.hindiPhrases.get(keys[i]) ?? []).find(([phrase]) => phrase.every((w, j) => keys[i + j] === w));
      if (hit) {
        if (hit[1]) out.push(hit[1]);
        i += hit[0].length;
      } else {
        out.push(words[i]);
        i++;
      }
    }
    return out.join(' ').replace(/\s+/g, ' ').trim();
  }

  private searchTerms(norm: string, rewrite = true) {
    // One pass, longest phrase first at each position, so a rewritten phrase is never rewritten again.
    const words = norm.split(' ');
    const outWords: string[] = [];
    for (let i = 0; i < words.length; ) {
      const hit = rewrite && this.replacements.find(([from]) => {
        const n = from.split(' ');
        return n.every((w, j) => words[i + j] === w);
      });
      if (hit) {
        outWords.push(hit[1]);
        i += hit[0].split(' ').length;
      } else {
        outWords.push(words[i]);
        i++;
      }
    }
    const phrase = outWords.join(' ').trim();
    const sizes = sizeTokens(phrase);
    const searchWords = phrase.split(' ').filter((w) => w && !STOP_WORDS.has(w) && !QUESTION_WORDS.has(w));
    const terms: string[] = [];
    const extra: string[] = [];
    for (const w of searchWords) {
      if (/^\d+(\.\d+)?(\/\d+)?$/.test(w)) continue; // plain numbers are sizes, not search words
      const corrected = correctWord(stem(w), this.vocabulary);
      if (QUESTION_WORDS.has(corrected) || QUESTION_WORDS.has(stem(w))) continue;
      terms.push(corrected);
      for (const r of this.related.get(w) ?? this.related.get(corrected) ?? []) extra.push(r);
      // "er32" also counts a little as "er", so "ER32 collet" prefers the ER Collet over other collet products.
      const code = /^([a-z]{2,4})\d+[a-z]?$/.exec(corrected);
      if (code && this.index.has(code[1])) extra.push(code[1]);
    }
    // A second form of the question with codes reduced to their prefix ("er32 collet" → "er collet") for phrase bonuses.
    const phrases = [phrase, phrase.replace(/\b([a-z]{2,4})\d+[a-z]?\b/g, '$1')];
    return { terms, extra, phrase: phrases, sizes };
  }

  /** Products the question is about, best first. Uses the previous turn's products for "it" / "this" questions. */
  private resolveProducts(
    terms: string[],
    extra: string[],
    phrase: string[],
    ctx: SidekickContext,
    norm: string,
    brand?: string,
  ): Product[] {
    const pronoun = PRONOUN.test(norm) && ctx.products.length > 0;
    if (!terms.length) return [];
    let hits = this.index.search(terms, extra, phrase, 30);
    if (brand) {
      const branded = hits.filter((h) => this.bySlug.get(h.id)?.brand === brand);
      if (branded.length) hits = branded;
    }
    const strong = this.strongHits(hits);
    if (pronoun && (!strong.length || strong[0].coverage < 1)) return [];
    this.lastCoverage = strong[0]?.coverage ?? 0;
    return strong.map((h) => this.bySlug.get(h.id)).filter((p): p is Product => !!p);
  }

  private strongHits(hits: SearchHit[]): SearchHit[] {
    if (!hits.length) return [];
    const best = hits[0];
    if (best.score < 2.2 || best.coverage < 0.5) return [];
    return hits.filter((h) => h.score >= best.score * 0.72 && h.coverage >= Math.min(best.coverage, 0.67)).slice(0, 6);
  }

  /** A category whose name the question uses ("lifting", "hand tools", "material handling"), when no single product fits better. */
  private categoryMatch(terms: string[], phrases: string[], found: Product[]): string | null {
    const phrase = phrases[0];
    if (!terms.length) return null;
    const hit = this.catIndex.search(terms, [], phrase, 3)[0];
    if (!hit || hit.coverage < 1) return null;
    const cat = this.categories.find((c) => c.slug === hit.id);
    if (!cat) return null;
    // Every word must appear in the category's own text: "welding machine" is not the rigging category just
    // because it lists weld-on fittings.
    const catWords = new Set(`${normalize(cat.name)} ${normalize(cat.highlights?.join(' ') ?? '')} ${normalize(cat.description)}`.split(' ').map(stem));
    if (!terms.every((t) => catWords.has(t))) return null;
    const named = ` ${phrase} `.includes(` ${normalize(cat.name)} `);
    // Prefer a product when the question names it exactly (e.g. "spring balancer" is also a hoists-category word).
    if (found.length && !named) {
      const p = found[0];
      if (` ${phrase} `.includes(` ${normalize(shortName(p.name))} `) || terms.every((t) => this.productHasTerm(p, t))) return null;
    }
    if (!named && terms.length > 2) return null;
    return cat.slug;
  }

  /**
   * The item the customer is asking for: "chain block for lifting machinery" → chain, block. Two readings: with
   * customer words rewritten to catalogue words ("grease pump" → grease gun) and as typed (there is also a
   * bucket grease pump).
   */
  private itemTerms(norm: string, terms: string[]): string[][] {
    const before = norm.split(/\b(?:for|to|with|used|which|that|in|on|from|at)\b/)[0];
    const keep = (list: string[]) => list.filter((t) => !UNITS.has(t) && !BRANDS.some((b) => b.re.test(t)));
    if (!before.trim()) return [keep(terms)];
    const rewritten = keep(this.searchTerms(before).terms);
    const typed = keep(this.searchTerms(before, false).terms);
    return [rewritten.length ? rewritten : keep(terms), typed];
  }

  /**
   * Products that are the kind of item asked for. The kind is the last word ("vernier **caliper**", "bosch
   * **drill**"); a generic last word ("welding **machine**") needs the word before it too.
   */
  private sameKind(products: Product[], item: string[][]): Product[] {
    const needs = item
      .map((alt) => {
        const head = alt[alt.length - 1];
        if (!head) return null;
        const need = GENERIC_HEADS.has(head) ? alt.slice(-2) : [head];
        return need.length < (GENERIC_HEADS.has(head) ? 2 : 1) ? null : need;
      })
      .filter((n): n is string[] => !!n);
    return products.filter((p) => needs.some((need) => need.every((t) => this.productHasTerm(p, t))));
  }

  private readonly wordsOf = new Map<string, Set<string>>();
  /** Whether a word appears anywhere in the product's own data (name, description, specs, size table). */
  private mentions(p: Product, term: string): boolean {
    let words = this.wordsOf.get(p.slug);
    if (!words) {
      const text = [
        p.name, p.subcategory, p.summary, p.description, p.brand ?? '',
        this.categories.find((c) => c.slug === p.category)?.name ?? '',
        ...p.specifications.flatMap((x) => [x.label, x.value]),
        ...p.variants.flatMap((v) => [v.label, ...Object.entries(v.attributes).flat()]),
      ].join(' ');
      words = new Set(normalize(text).split(' ').map(stem));
      this.wordsOf.set(p.slug, words);
    }
    return words.has(term);
  }

  private productHasTerm(p: Product, term: string): boolean {
    const words = `${normalize(p.name)} ${normalize(p.subcategory)}`.split(' ').map(stem);
    return words.includes(term);
  }

  private comparePair(norm: string): [Product, Product] | null {
    const body = norm.replace(/\b(what is|what s|whats|the|difference|differences|between|compare|comparison|which is better|better|explain)\b/g, ' ');
    const parts = body.split(/\b(?:vs|versus|and|or|with|than)\b/).map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const pick = (text: string) => {
      const { terms, extra, phrase } = this.searchTerms(normalize(text));
      const hit = this.strongHits(this.index.search(terms, extra, phrase, 5))[0];
      return hit ? this.bySlug.get(hit.id) : undefined;
    };
    const a = pick(parts[0]);
    const b = pick(parts.slice(1).join(' '));
    return a && b && a.slug !== b.slug ? [a, b] : null;
  }

  /** A trade named in the question when nothing more specific is asked ("tools for electrician"). */
  private jobFor(norm: string, terms: string[]): string | null {
    const jobs = this.knowledge.synonyms.jobs ?? {};
    const named = Object.keys(jobs).find((j) => ` ${norm} `.includes(` ${normalize(j)} `));
    if (!named) return null;
    const jobStem = stem(normalize(named));
    return terms.every((t) => t === jobStem || t === normalize(named)) ? named : null;
  }

  private jobReply(job: string, ctx: SidekickContext): Reply {
    const picks: Product[] = [];
    for (const want of this.knowledge.synonyms.jobs?.[job] ?? []) {
      const { terms, extra, phrase } = this.searchTerms(normalize(want));
      const hit = this.index.search(terms, extra, phrase, 3).find((h) => !picks.some((p) => p.slug === h.id));
      const p = hit && this.bySlug.get(hit.id);
      if (p) picks.push(p);
    }
    ctx.products = picks.map((p) => p.slug);
    return this.reply(
      'info',
      [
        { kind: 'text', text: `For ${JOB_LABEL[job] ?? job}, these tools from our catalogue fit the job:` },
        { kind: 'links', items: picks.map((p) => ({ label: p.name, route: `/products/${p.slug}`, meta: p.brand || undefined })) },
        { kind: 'note', text: 'Tap any product for sizes, or ask me how one is used.' },
      ],
      picks.slice(0, 3).map((p) => ({ label: `What is ${shortName(p.name)} used for?`, ask: `What is ${shortName(p.name)} used for?` })),
      [{ kind: 'whatsapp', label: 'Send your list on WhatsApp' }],
      picks,
      ctx,
    );
  }

  // ── Knowledge helpers ────────────────────────────────────────────────────────────────────────────────────────

  private guideFor(p: Product): GuideEntry | undefined {
    const id = this.knowledge.productGuide[p.slug];
    return id ? this.knowledge.guides[id] : undefined;
  }

  private passagesFor(p: Product, max = 2): string[] {
    return (this.knowledge.productPassages[p.slug] ?? [])
      .slice(0, max)
      .map((i) => this.knowledge.passages[i]?.t)
      .filter((t): t is string => !!t);
  }

  private features(p: Product, max = 4): string[] {
    return p.specifications
      .filter((s) => s.label === 'Feature' || s.label === 'Application')
      .map((s) => s.value)
      .filter((v) => !/^(lower|neutral|lifting) position|^steering/i.test(v))
      .slice(0, max);
  }

  private operatingNotes(p: Product): string[] {
    return p.specifications
      .filter((s) => /safe use|operation|instruction/i.test(s.label) || (s.label === 'Feature' && /^(lower|neutral|lifting) position|^steering/i.test(s.value)))
      .map((s) => s.value);
  }

  private ref(p: Product): ProductRef {
    return { slug: p.slug, name: p.name, summary: p.summary, brand: p.brand, image: p.images[0] ?? null, category: p.category };
  }

  private categoryName(slug: string): string {
    return this.categories.find((c) => c.slug === slug)?.name ?? slug;
  }

  /** Sizes listed for a product, compactly: every label for short tables, value ranges per column for long ones. */
  private sizeSummary(p: Product): { rows: { label: string; value: string }[]; labels: string[] } {
    const axes = p.variantAxes.filter((a) => !/^(item code|product no)/i.test(a));
    const labels = [...new Set(p.variants.map((v) => v.label))];
    const rows: { label: string; value: string }[] = [];
    for (const axis of axes.slice(0, 4)) {
      const values = [...new Set(p.variants.map((v) => v.attributes[axis]).filter((x) => x && x !== '—'))];
      if (!values.length) continue;
      rows.push({ label: axis, value: values.length <= 12 ? values.join(', ') : `${values[0]} to ${values[values.length - 1]} (${values.length} sizes)` });
    }
    if (!p.variants.length) {
      for (const s of p.specifications) {
        if (/size|range|dia|length|capacity|bore|shank|taper|collet|model|thread/i.test(s.label) && s.label !== 'Feature') rows.push(s);
      }
    }
    return { rows, labels };
  }

  /**
   * Variants matching the sizes in the question ("er32", "10 mm", "2 t", "1/2 inch"). Looked for in order: the size
   * label ("CBRL0203 · 2 t"), then the column for that unit (tonnes → capacity / WLL, mm → size / bore …), then any
   * column. Ranges such as "2–20 mm (1 mm step)" count when the size falls inside them.
   * Codes and numbers that are part of the product's own name ("BT-40", the "1/2" of a 1/2" drive socket) are ignored.
   */
  private matchVariants(p: Product, sizes: SizeToken[]): ProductVariant[] {
    const own = this.ownSizes(p, sizes);
    if (!own.length || !p.variants.length) return [];
    for (const tier of [0, 1, 2] as const) {
      const hits = p.variants.filter((v) => own.every((s) => this.sizeFits(v, s, tier)));
      if (hits.length) return hits;
    }
    return [];
  }

  /** "er32" → "ER-32", "m16" → "M16", "2 t" → "2 ton". */
  private prettySizes(sizes: SizeToken[]): string {
    return sizes
      .map((s) => {
        if (s.code) {
          const m = /^([a-z]+)(\d.*)$/.exec(s.code);
          if (!m) return s.code.toUpperCase();
          return /^(er|bt|mt|iso|sk|cat|rbt|hsk|e)$/.test(m[1]) ? `${m[1].toUpperCase()}-${m[2].toUpperCase()}` : s.code.toUpperCase();
        }
        return s.raw.replace(/ t$/, ' ton').replace(/ inch$/, '"');
      })
      .join(', ');
  }

  /** The sizes from the question that describe a variant, not the product itself. */
  private ownSizes(p: Product, sizes: SizeToken[]): SizeToken[] {
    const nameWords = new Set(normalize(p.name).split(' '));
    const nameNumbers = this.numbersIn(p.name);
    return sizes.filter((s) => {
      if (s.code) return !nameWords.has(s.code);
      if (!s.unit && s.value !== null) return !nameNumbers.some((n) => Math.abs(n - s.value!) < 1e-6);
      return true;
    });
  }

  private static readonly UNIT_COLUMN: Record<string, RegExp> = {
    t: /capacity|\(t\)|tonne|\bton|w\.?\s?l\.?\s?l|swl|working load/i,
    kg: /kg|capacity|w\.?\s?l\.?\s?l|swl|working load/i,
    mm: /mm|size|dia|ø|length|width|bore|shank/i,
    inch: /inch|\bin\b|"|size/i,
  };

  private numbersIn(text: string): number[] {
    const out: number[] = [];
    for (const w of normalize(text).split(' ')) {
      let m: RegExpExecArray | null;
      if ((m = /^(\d+)\.(\d+)\/(\d+)$/.exec(w))) out.push(Number(m[1]) + Number(m[2]) / Number(m[3])); // catalogue "1.1/8"
      if ((m = /^(\d+(?:\.\d+)?)\/(\d+)$/.exec(w))) out.push(Number(m[1]) / Number(m[2]));
      else if (/^\d+(\.\d+)?$/.test(w)) out.push(Number(w));
    }
    return out;
  }

  /** "2–20 mm (1 mm step)", "10 - 34", "3 to 20 mm" → ranges, with the step when one is printed. */
  private rangesIn(text: string): { from: number; to: number; step: number | null }[] {
    const out: { from: number; to: number; step: number | null }[] = [];
    const step = /\((\d+(?:\.\d+)?)\s*mm step\)/i.exec(text);
    const re = /(\d+(?:\.\d+)?)\s*(?:[–—-]|to)\s*(\d+(?:\.\d+)?)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const from = Number(m[1]);
      const to = Number(m[2]);
      if (to > from) out.push({ from, to, step: step ? Number(step[1]) : null });
    }
    return out;
  }

  private holds(text: string, want: number[]): boolean {
    if (this.numbersIn(text).some((x) => want.some((w) => Math.abs(x - w) < 1e-6))) return true;
    return this.rangesIn(text).some((r) =>
      want.some((w) => w >= r.from - 1e-6 && w <= r.to + 1e-6 && (!r.step || Math.abs(((w - r.from) / r.step) % 1) < 1e-6 || Math.abs(((w - r.from) / r.step) % 1) > 1 - 1e-6)),
    );
  }

  private sizeFits(v: ProductVariant, s: SizeToken, tier: 0 | 1 | 2): boolean {
    const all = `${v.label} ${Object.values(v.attributes).join(' ')}`;
    if (s.code) return new Set(normalize(tier === 0 ? v.label : all).split(' ')).has(s.code);
    if (s.value === null) return true;
    const want = [s.value];
    if (s.unit === 'kg' && s.value >= 100) want.push(s.value / 1000);
    if (s.unit === 't') want.push(s.value * 1000);
    if (tier === 2) return this.holds(all, want);
    if (tier === 0) {
      if (!s.unit) return this.holds(v.label, want);
      const label = ` ${normalize(v.label)} `;
      if (want.some((w) => label.includes(` ${w} ${s.unit} `))) return true;
      return new RegExp(`\\b${s.unit === 'inch' ? '(inch|")' : s.unit}\\b`, 'i').test(v.label) && this.holds(v.label, want);
    }
    const column = s.unit ? SidekickEngine.UNIT_COLUMN[s.unit] : null;
    return Object.entries(v.attributes).some(([key, value]) => (!column || column.test(key)) && this.holds(value, want));
  }

  // ── Replies ──────────────────────────────────────────────────────────────────────────────────────────────────

  private infoReply(found: Product[], ctx: SidekickContext): Reply {
    const p = found[0];
    const guide = this.guideFor(p);
    const blocks: Block[] = [];
    if (found.length > 2) {
      blocks.push({ kind: 'text', text: `Here's what we list for that — ${found.length} matching products:` });
      blocks.push({ kind: 'products', items: found.slice(0, 4).map((x) => this.ref(x)) });
      // One shared explanation only when the products are the same kind of tool.
      if (guide && found.slice(0, 4).every((x) => this.knowledge.productGuide[x.slug] === this.knowledge.productGuide[p.slug])) {
        blocks.push({ kind: 'text', text: `**${shortName(guide.title)}** — ${guide.uses}` });
      }
    } else {
      blocks.push({ kind: 'text', text: `**${p.name}**${p.brand ? ` (${p.brand})` : ''} — ${p.summary}.` });
      blocks.push({ kind: 'text', text: p.description });
      if (guide) blocks.push({ kind: 'text', text: `**Where it's used:** ${guide.uses}` });
      blocks.push({ kind: 'products', items: found.slice(0, 2).map((x) => this.ref(x)) });
    }
    return this.reply('info', blocks, this.productSuggestions(p, 'info'), this.productActions(p), found, ctx);
  }

  private availabilityReply(found: Product[], ctx: SidekickContext, sizes: SizeToken[]): Reply {
    const p = found[0];
    const blocks: Block[] = [];
    if (sizes.length && p.variants.length) return this.sizesReply(found, ctx, sizes);
    blocks.push({
      kind: 'text',
      text: found.length > 1
        ? `Yes — these are in our catalogue:`
        : `Yes — **${p.name}**${p.brand ? ` (${p.brand})` : ''} is in our catalogue: ${p.summary}.`,
    });
    blocks.push({ kind: 'products', items: found.slice(0, 4).map((x) => this.ref(x)) });
    blocks.push({ kind: 'note', text: 'For current stock and price, message the team on WhatsApp — they reply with availability.' });
    return this.reply('availability', blocks, this.productSuggestions(p, 'availability'), this.productActions(p), found, ctx);
  }

  private usesReply(found: Product[], ctx: SidekickContext): Reply {
    const p = found[0];
    const guide = this.guideFor(p);
    const blocks: Block[] = [];
    if (guide) {
      blocks.push({ kind: 'text', text: `**${shortName(guide.title)}** — ${guide.uses}` });
    } else {
      blocks.push({ kind: 'text', text: `**${p.name}** — ${p.description}` });
    }
    const feats = this.features(p);
    if (feats.length) blocks.push({ kind: 'list', title: `From the catalogue (${shortName(p.name)})`, items: feats });
    else if (guide) blocks.push({ kind: 'text', text: `From the catalogue: ${p.description}` });
    const passages = this.passagesFor(p, feats.length ? 1 : 2).filter((t) => !feats.some((f) => f.includes(t.slice(0, 30))));
    if (passages.length) blocks.push({ kind: 'note', text: passages.join(' ') });
    blocks.push({ kind: 'products', items: found.slice(0, found.length > 2 ? 4 : 2).map((x) => this.ref(x)) });
    return this.reply('uses', blocks, this.productSuggestions(p, 'uses'), this.productActions(p), found, ctx);
  }

  private howToReply(found: Product[], ctx: SidekickContext): Reply {
    const p = found[0];
    const guide = this.guideFor(p);
    const blocks: Block[] = [];
    const notes = this.operatingNotes(p);
    if (!guide && !notes.length) {
      blocks.push({ kind: 'text', text: `Our team can explain how to use **${p.name}** — message them on WhatsApp.` });
      return this.reply('howto', blocks, this.productSuggestions(p, 'howto'), this.productActions(p), found, ctx);
    }
    blocks.push({ kind: 'text', text: `How to use a **${shortName(guide?.title ?? p.name).toLowerCase()}**:` });
    if (notes.length) blocks.push({ kind: 'list', title: 'From the catalogue', items: notes });
    if (guide) blocks.push({ kind: 'list', items: guide.how, ordered: true });
    if (guide?.tips?.length) blocks.push({ kind: 'note', text: `Safety: ${guide.tips.join(' ')}` });
    blocks.push({ kind: 'note', text: `General guidance — always follow the maker's instructions and the limits marked on the product.` });
    blocks.push({ kind: 'products', items: [this.ref(p)] });
    return this.reply('howto', blocks, this.productSuggestions(p, 'howto'), this.productActions(p), found, ctx);
  }

  private sizesReply(found: Product[], ctx: SidekickContext, sizes: SizeToken[]): Reply {
    // With a size in the question, check each matching product until one lists it.
    if (sizes.length) {
      for (const p of found.filter((x) => x.variants.length)) {
        const matches = this.matchVariants(p, sizes);
        if (matches.length) {
          ctx.products = [p.slug, ...found.filter((x) => x !== p).map((x) => x.slug)];
          const asked = this.prettySizes(this.ownSizes(p, sizes));
          const blocks: Block[] = [
            {
              kind: 'text',
              text: matches.length === 1
                ? `Yes — we list **${p.name}** in ${asked}:`
                : `Yes — **${p.name}** is listed in ${asked}, in ${matches.length} sizes:`,
            },
          ];
          // One or two sizes: show their rows from the table; more: list them as chips.
          if (matches.length <= 2) blocks.push(...this.variantFacts(p, matches));
          else blocks.push({ kind: 'sizes', title: 'Matching sizes', items: matches.slice(0, 16).map((v) => v.label), more: Math.max(0, matches.length - 16), slug: p.slug });
          blocks.push({ kind: 'products', items: [this.ref(p)] });
          const actions = this.productActions(p, matches.length === 1 ? matches[0] : undefined);
          return this.reply('sizes', blocks, this.productSuggestions(p, 'sizes'), actions, [p, ...found.filter((x) => x !== p)], ctx);
        }
      }
      const p = found[0];
      const { rows } = this.sizeSummary(p);
      const asked = this.prettySizes(this.ownSizes(p, sizes));
      const blocks: Block[] = [
        {
          kind: 'text',
          text: `For **${p.name}**${asked ? ` in ${asked}` : ' in this size'}, please contact our team — not every size is printed in the catalogue, and they'll check it for you.`,
        },
      ];
      if (rows.length) blocks.push({ kind: 'facts', title: 'Sizes on the website', rows });
      blocks.push({ kind: 'products', items: [this.ref(p)] });
      const actions = this.productActions(p, undefined, asked ? `Size needed: ${asked}` : undefined);
      return this.reply('sizes', blocks, this.productSuggestions(p, 'sizes'), actions, found, ctx);
    }

    const p = found[0];
    const { rows, labels } = this.sizeSummary(p);
    const blocks: Block[] = [];
    if (found.length > 2) {
      blocks.push({ kind: 'text', text: `Several products match — here are the sizes for **${p.name}**. Tap another product below for its sizes.` });
    }
    if (p.variants.length) {
      blocks.push({ kind: 'text', text: `**${p.name}** — ${p.variants.length} size${p.variants.length === 1 ? '' : 's'} listed (${p.summary}).` });
      if (rows.length && labels.length > 16) blocks.push({ kind: 'facts', rows });
      blocks.push({ kind: 'sizes', title: 'Sizes', items: labels.slice(0, 16), more: Math.max(0, labels.length - 16), slug: p.slug });
    } else {
      blocks.push({ kind: 'text', text: `**${p.name}** — ${p.summary}.` });
      if (rows.length) blocks.push({ kind: 'facts', rows });
      blocks.push({ kind: 'note', text: 'The full size table is on the product page.' });
    }
    blocks.push({ kind: 'products', items: found.slice(0, found.length > 2 ? 4 : 1).map((x) => this.ref(x)) });
    return this.reply('sizes', blocks, this.productSuggestions(p, 'sizes'), this.productActions(p), found, ctx);
  }

  /** One size's row from the table — the most useful columns first, at most ten. */
  private variantFacts(p: Product, variants: ProductVariant[]): Block[] {
    const rank = (key: string) =>
      /item code|product no/i.test(key) ? 0 : /capacity|w\.?\s?l\.?\s?l|size|type|model|collet|taper/i.test(key) ? 1 : /weight/i.test(key) ? 3 : 2;
    return variants.map((v) => {
      const rows = Object.entries(v.attributes)
        .filter(([, value]) => value && value !== '—')
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => rank(a.label) - rank(b.label));
      return { kind: 'facts' as const, title: v.label, rows: rows.length > 10 ? [...rows.slice(0, 9), { label: 'More', value: 'Full row on the product page' }] : rows };
    });
  }

  private specsReply(found: Product[], ctx: SidekickContext, sizes: SizeToken[]): Reply {
    const p = found[0];
    const blocks: Block[] = [];
    const matches = this.matchVariants(p, sizes);
    if (matches.length && matches.length <= 3) {
      blocks.push({ kind: 'text', text: `Details for **${p.name}** — ${matches.map((m) => m.label).join(', ')}:` });
      blocks.push(...this.variantFacts(p, matches));
    } else {
      blocks.push({ kind: 'text', text: `**${p.name}**${p.brand ? ` (${p.brand})` : ''} — ${p.summary}.` });
      const rows = p.specifications.filter((s) => s.label !== 'Feature' && s.label !== 'Safe use').slice(0, 8);
      if (p.standard && !rows.some((r) => /standard/i.test(r.label))) rows.unshift({ label: 'Standard', value: p.standard });
      if (rows.length) blocks.push({ kind: 'facts', title: 'Specifications', rows });
      const feats = this.features(p, 5);
      if (feats.length) blocks.push({ kind: 'list', title: 'Features', items: feats });
      if (p.variants.length) {
        blocks.push({
          kind: 'note',
          text: `Each size's measurements (${listText(p.variantAxes.slice(0, 5))}) are in the size table on the product page — or ask me for a size, e.g. "${p.variants[0].label}".`,
        });
      }
    }
    blocks.push({ kind: 'products', items: [this.ref(p)] });
    return this.reply('specs', blocks, this.productSuggestions(p, 'specs'), this.productActions(p, matches.length === 1 ? matches[0] : undefined), found, ctx);
  }

  private priceReply(found: Product[], ctx: SidekickContext, sizes: SizeToken[] = []): Reply {
    const p = found[0];
    const variant = p ? this.matchVariants(p, sizes) : [];
    const blocks: Block[] = [
      {
        kind: 'text',
        text: p
          ? `Prices aren't listed on the website. Send the team the size and quantity of **${p.name}** on WhatsApp and they'll reply with the current price and availability.`
          : `Prices aren't listed on the website. Tell the team the product, size and quantity on WhatsApp and they'll reply with the current price and availability.`,
      },
    ];
    if (p) blocks.push({ kind: 'products', items: [this.ref(p)] });
    const actions: ReplyAction[] = p
      ? [{ kind: 'whatsapp', label: 'Get a quote on WhatsApp', slug: p.slug, variantId: variant.length === 1 ? variant[0].id : undefined }, { kind: 'route', label: 'Quote form', route: '/get-a-quote', query: { product: p.slug } }]
      : [{ kind: 'whatsapp', label: 'Ask on WhatsApp' }, { kind: 'route', label: 'Quote form', route: '/get-a-quote' }, { kind: 'call', label: `Call ${this.company.phoneDisplay}` }];
    return this.reply('price', blocks, p ? this.productSuggestions(p, 'price') : this.starterSuggestions(), actions, found, ctx);
  }

  private compareReply(a: Product, b: Product, ctx: SidekickContext): Reply {
    const ga = this.guideFor(a);
    const gb = this.guideFor(b);
    ctx.products = [a.slug, b.slug];
    const blocks: Block[] = [{ kind: 'text', text: `Here's how they differ:` }];
    for (const [p, g] of [[a, ga], [b, gb]] as [Product, GuideEntry | undefined][]) {
      blocks.push({ kind: 'text', text: `**${shortName(g?.title ?? p.name)}** — ${g?.uses ?? p.description}` });
    }
    blocks.push({ kind: 'products', items: [this.ref(a), this.ref(b)] });
    const suggestions: Suggestion[] = [
      { label: `How to use ${shortName(a.name)}`, ask: `How to use ${shortName(a.name)}?` },
      { label: `How to use ${shortName(b.name)}`, ask: `How to use ${shortName(b.name)}?` },
    ];
    return this.reply('compare', blocks, suggestions, [{ kind: 'whatsapp', label: 'Ask the team which suits your job' }], [a, b], ctx);
  }

  private categoryReply(slug: string, ctx: SidekickContext, liftingMaker = false): Reply {
    const cat = this.categories.find((c) => c.slug === slug);
    if (!cat) return this.categoriesReply(ctx);
    const products = [...this.bySlug.values()].filter((p) => p.category === slug);
    ctx.products = products.slice(0, 4).map((p) => p.slug);
    ctx.category = slug;
    const blocks: Block[] = [];
    if (liftingMaker) {
      blocks.push({ kind: 'text', text: 'Our lifting and material handling range covers hoists, chain pulley blocks, slings, shackles, hooks, plate clamps, magnets, pallet trucks and stackers:' });
      blocks.push({
        kind: 'links',
        items: this.categories
          .filter((c) => !c.brands.length)
          .map((c) => ({ label: c.name, route: `/categories/${c.slug}`, meta: `${c.count} products` })),
      });
    } else {
      blocks.push({ kind: 'text', text: `**${cat.name}** — ${cat.description}` });
      const pictured = products.filter((p) => p.featured || p.images.length);
      blocks.push({ kind: 'products', items: (pictured.length ? pictured : products).slice(0, 4).map((p) => this.ref(p)) });
      blocks.push({ kind: 'links', items: [{ label: `See all ${cat.count} ${cat.name.toLowerCase()}`, route: `/categories/${cat.slug}` }] });
    }
    const sample = products[0];
    const suggestions: Suggestion[] = sample
      ? [
          { label: `What is ${shortName(sample.name)} used for?`, ask: `What is ${shortName(sample.name)} used for?` },
          { label: `Sizes of ${shortName(sample.name)}`, ask: `What sizes of ${shortName(sample.name)} do you have?` },
          { label: 'All categories', ask: 'What products do you sell?' },
        ]
      : this.starterSuggestions();
    return this.reply('categories', blocks, suggestions, [{ kind: 'route', label: `Open ${cat.name}`, route: `/categories/${cat.slug}` }], [], ctx);
  }

  private categoriesReply(ctx: SidekickContext): Reply {
    const total = this.categories.reduce((n, c) => n + c.count, 0);
    return this.reply(
      'categories',
      [
        { kind: 'text', text: `We list ${total} products in ${this.categories.length} categories:` },
        { kind: 'links', items: this.categories.map((c) => ({ label: c.name, route: `/categories/${c.slug}`, meta: `${c.count}` })) },
      ],
      this.starterSuggestions(),
      [{ kind: 'route', label: 'Browse all products', route: '/products' }],
      [],
      ctx,
    );
  }

  private brandReply(brand: string, ctx: SidekickContext): Reply {
    const cats = this.categories.filter((c) => c.brands.includes(brand));
    const count = [...this.bySlug.values()].filter((p) => p.brand === brand).length;
    return this.reply(
      'brand',
      [
        { kind: 'text', text: `We list ${count} ${brand} products, in these categories:` },
        { kind: 'links', items: cats.map((c) => ({ label: c.name, route: `/categories/${c.slug}` })) },
        { kind: 'note', text: `Buy from our shop at ${this.company.addressLines.join(', ')}, ${this.company.city} ${this.company.pincode}, or send your list on WhatsApp for a quote.` },
      ],
      this.starterSuggestions(),
      [{ kind: 'route', label: `All ${brand} products`, route: '/products', query: { brand } }],
      [],
      ctx,
    );
  }

  private hoursText(): string[] {
    return this.company.hours.map((h) => `${h.label}: ${h.opens && h.closes ? `${this.time(h.opens)} – ${this.time(h.closes)}` : 'Closed'}`);
  }

  private time(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
  }

  private hoursReply(ctx: SidekickContext): Reply {
    return this.reply('hours', [{ kind: 'text', text: 'Our opening hours (Kolkata time):' }, { kind: 'list', items: this.hoursText() }], this.starterSuggestions(), [
      { kind: 'call', label: `Call ${this.company.phoneDisplay}` },
      { kind: 'map', label: 'Directions' },
    ], [], ctx);
  }

  private contactReply(ctx: SidekickContext, location: boolean): Reply {
    const c = this.company;
    const address = `${c.addressLines.join(', ')}, ${c.city} ${c.pincode}`;
    const rows = [
      { label: 'Address', value: address },
      { label: 'Phone', value: c.phoneDisplay },
      { label: 'WhatsApp', value: c.whatsappDisplay },
      { label: 'Email', value: c.email },
    ];
    return this.reply(
      location ? 'location' : 'contact',
      [
        { kind: 'text', text: location ? `We're at **${address}**.` : `You can reach ${c.name} here:` },
        { kind: 'facts', rows: location ? rows.slice(1) : rows },
        { kind: 'list', title: 'Opening hours', items: this.hoursText() },
      ],
      this.starterSuggestions(),
      [{ kind: 'whatsapp', label: 'WhatsApp us' }, { kind: 'call', label: 'Call' }, { kind: 'map', label: 'Directions' }],
      [],
      ctx,
    );
  }

  private orderReply(ctx: SidekickContext, found: Product[]): Reply {
    const p = found[0];
    if (p) ctx.products = [p.slug];
    const blocks: Block[] = [
      {
        kind: 'text',
        text: `To order${p ? ` **${p.name}**` : ''}, send the team the product, size and quantity on WhatsApp or email — they reply with the price and availability.`,
      },
      { kind: 'text', text: 'For delivery, payment terms, GST invoices or bulk orders, please ask the team directly — they will confirm the details for your order.' },
    ];
    if (p) blocks.push({ kind: 'products', items: [this.ref(p)] });
    const actions: ReplyAction[] = p
      ? this.productActions(p)
      : [{ kind: 'whatsapp', label: 'WhatsApp the team' }, { kind: 'email', label: 'Email' }, { kind: 'route', label: 'Quote form', route: '/get-a-quote' }];
    return this.reply('order', blocks, p ? this.productSuggestions(p, 'order') : this.starterSuggestions(), actions, found, ctx);
  }

  private humanReply(ctx: SidekickContext): Reply {
    const p = ctx.products[0] ? this.bySlug.get(ctx.products[0]) : undefined;
    return this.reply(
      'human',
      [{ kind: 'text', text: `Of course — the ${this.company.name} team is on WhatsApp and phone (${this.company.phoneDisplay}).` }, { kind: 'list', title: 'Opening hours', items: this.hoursText() }],
      [],
      [p ? { kind: 'whatsapp', label: `WhatsApp about ${shortName(p.name)}`, slug: p.slug } : { kind: 'whatsapp', label: 'WhatsApp the team' }, { kind: 'call', label: 'Call now' }],
      [],
      ctx,
    );
  }

  private greetingReply(ctx: SidekickContext): Reply {
    return this.reply('greeting', [{ kind: 'text', text: `Hello! What are you looking for today? You can name a tool, a size, or the job you need it for.` }], this.starterSuggestions(), [], [], ctx);
  }

  // ── The company and its owner ────────────────────────────────────────────────────────────────────────────────
  // Only facts the site already states (company settings, About page, catalogue counts). Anything else — who
  // founded it, dealership status, registration numbers — is passed to the team, never guessed.

  private namesOwner(norm: string): boolean {
    const words = normalize(this.company.owner.name).split(' ').filter((w) => w.length > 3);
    return words.some((w) => new RegExp(`\\b${w}\\b`).test(norm));
  }

  /** "What is Steel Tools India?", "about steel tools india" — the name and nothing that points at a product. */
  private onlyCompanyName(norm: string): boolean {
    const name = normalize(this.company.name);
    if (!` ${norm} `.includes(` ${name} `)) return false;
    const rest = norm.replace(name, ' ').trim();
    return !rest || this.searchTerms(rest).terms.every((t) => COMPANY_WORDS.has(t));
  }

  private yearsInBusiness(): number {
    return new Date().getFullYear() - this.company.foundedYear;
  }

  private companyStats() {
    const products = [...this.bySlug.values()];
    const brands = new Map<string, number>();
    for (const p of products) if (p.brand) brands.set(p.brand, (brands.get(p.brand) ?? 0) + 1);
    return {
      products: products.length,
      categories: this.categories.length,
      sizes: products.reduce((n, p) => n + p.variants.length, 0),
      brands: [...brands.entries()].sort((a, b) => b[1] - a[1]),
      unbranded: products.filter((p) => !p.brand).length,
    };
  }

  private companyActions(): ReplyAction[] {
    return [
      { kind: 'whatsapp', label: 'WhatsApp the team' },
      { kind: 'call', label: `Call ${this.company.phoneDisplay}` },
      { kind: 'route', label: 'About us', route: '/about-us' },
    ];
  }

  private companySuggestions(skip: string): Suggestion[] {
    return [
      { label: 'Who is the owner?', ask: 'Who is the owner?' },
      { label: 'About the company', ask: 'Tell me about your company' },
      { label: 'Which brands do you deal in?', ask: 'Which brands do you deal in?' },
      { label: 'Where is your shop?', ask: 'Where is your shop?' },
    ].filter((s) => s.ask !== skip);
  }

  private ownerReply(norm: string, ctx: SidekickContext): Reply {
    const { name, city, foundedYear, owner } = this.company;
    const aboutFounding = /\b(found|founder|founders|founded|started|start|establish|established)\b/.test(norm);
    const blocks: Block[] = [
      {
        kind: 'text',
        text: aboutFounding
          ? `${name} was established in ${foundedYear} in ${city}. Today it is owned and run by **${owner.name}**.`
          : `${name} is owned and run by **${owner.name}**.`,
      },
      {
        kind: 'text',
        text: `Under his leadership the business carries on the work it has done in ${city} since ${foundedYear} — supplying machine tool accessories, cutting tools, hand tools and lifting equipment to the workshops and industries that rely on them.`,
      },
      { kind: 'note', text: `To speak with him or the team, message us on WhatsApp or call ${this.company.phoneDisplay}.` },
    ];
    return this.reply('owner', blocks, this.companySuggestions('Who is the owner?'), this.companyActions(), [], { ...ctx, products: [] });
  }

  private companyReply(norm: string, ctx: SidekickContext): Reply {
    const { name, city, foundedYear, owner } = this.company;
    const years = this.yearsInBusiness();
    const stats = this.companyStats();
    const brandNames = listText(stats.brands.map(([b]) => b));
    const range = `${brandNames}, plus our lifting & material handling range`;
    const next = { ...ctx, products: [] };
    const actions = this.companyActions();

    // How many products / categories / sizes.
    if (/\bhow many (products|items|categories|tools|sizes|variants)\b/.test(norm)) {
      return this.reply('company', [
        { kind: 'text', text: `We list **${stats.products} products** in **${stats.categories} categories** — **${stats.sizes.toLocaleString('en-IN')} sizes and variants** in all.` },
        { kind: 'text', text: `They come from ${range}.` },
      ], this.companySuggestions(''), [
        { kind: 'route', label: 'Browse all products', route: '/products' },
        { kind: 'route', label: 'All categories', route: '/categories' },
      ], [], next);
    }

    // Manufacturer, dealer, supplier, authorised…
    if (/\b(manufactur\w*|make|produce|dealer|distributor|retailer|wholesaler|stockist|trader|supplier|authori[sz]ed)\b/.test(norm)) {
      return this.reply('company', [
        { kind: 'text', text: `${name} is a supplier: we deal in tools from ${range}, and supply them to workshops and industries from our shop in ${city}.` },
        { kind: 'note', text: 'For dealership, bulk supply or special requirements, please contact our team — they will help you directly.' },
      ], this.companySuggestions('Which brands do you deal in?'), actions, [], next);
    }

    // Brands.
    if (/\bbrands?\b/.test(norm)) {
      return this.reply('company', [
        { kind: 'text', text: 'We deal in these brands:' },
        {
          kind: 'list',
          items: [
            ...stats.brands.map(([b, n]) => `${b} — ${n} products`),
            `Lifting & material handling range — ${stats.unbranded} products`,
          ],
        },
        { kind: 'note', text: `Buy from our shop in ${city}, or send your list on WhatsApp for a quote.` },
      ], this.companySuggestions('Which brands do you deal in?'),
      stats.brands.slice(0, 3).map(([b]) => ({ kind: 'route' as const, label: `${b} products`, route: '/products', query: { brand: b } })), [], next);
    }

    // History: since when, how old, established.
    if (/\b(history|established|establishment|founded|since when|how old|how long|years|experience|kab se|kitne saal|legacy|background|start|started)\b/.test(norm)) {
      return this.reply('company', [
        { kind: 'text', text: `${name} was established in **${foundedYear}** in ${city} — that's ${years} years in business.` },
        { kind: 'text', text: `Today it is owned and run by **${owner.name}**, and supplies machine tool accessories, cutting tools, hand tools and lifting equipment to the workshops and industries that rely on them.` },
      ], this.companySuggestions(''), actions, [], next);
    }

    // The full profile.
    return this.reply('company', [
      { kind: 'text', text: `**${name}** is a tooling business in ${city}, established in ${foundedYear} — ${years} years in business.` },
      { kind: 'text', text: `It is owned and run by **${owner.name}**. We supply machine tool accessories, cutting tools, hand tools and lifting equipment to the workshops and industries that rely on them, from ${range}.` },
      {
        kind: 'facts',
        rows: [
          { label: 'Established', value: String(foundedYear) },
          { label: owner.role, value: owner.name },
          { label: 'Address', value: `${this.company.addressLines.join(', ')}, ${city} ${this.company.pincode}` },
          { label: 'Products listed', value: `${stats.products} in ${stats.categories} categories` },
          { label: 'Sizes & variants', value: stats.sizes.toLocaleString('en-IN') },
        ],
      },
      { kind: 'note', text: 'Prices are on request — message the team on WhatsApp for price and availability.' },
    ], this.companySuggestions('Tell me about your company'), actions, [], next);
  }

  private aboutReply(ctx: SidekickContext): Reply {
    return this.reply(
      'about',
      [
        { kind: 'text', text: `I'm Sidekick — ${this.company.name}'s product helper. I've been trained on our supplier catalogues (R★R Brand, Miranda, Taparia, and our lifting & material handling range), so I can tell you what a tool is used for, how to use it and which sizes we list. I can also tell you about ${this.company.name} itself — our history, our owner and the brands we deal in.` },
        { kind: 'text', text: `I don't quote prices — for those I'll connect you with the team on WhatsApp.` },
      ],
      this.starterSuggestions(),
      [],
      [],
      ctx,
    );
  }

  private helpReply(ctx: SidekickContext): Reply {
    return this.reply(
      'help',
      [
        { kind: 'text', text: 'Try asking me things like:' },
        { kind: 'list', items: ['"Do you have chain pulley blocks?"', '"What is a revolving centre used for?"', '"How to use a torque wrench?"', '"ER32 collet 10 mm"', '"Difference between dead centre and revolving centre"', '"Who is the owner?"', '"Where is your shop?"', '"Chain kuppi hai kya?" — Hindi works too'] },
      ],
      this.starterSuggestions(),
      [],
      [],
      ctx,
    );
  }

  /** Nothing matched at all — still no dead end: the team is one tap away. */
  private unknownReply(raw: string, terms: string[], extra: string[], phrase: string[], item: string[][], ctx: SidekickContext): Reply {
    const weak = this.sameKind(
      this.index.search(terms, extra, phrase, 6).filter((h) => h.score > 1.2).map((h) => this.bySlug.get(h.id)!).filter(Boolean),
      item,
    );
    if (weak.length) return this.unlistedReply(weak, ctx);
    const blocks: Block[] = [
      { kind: 'text', text: `Please contact our team for this — they'll check and get back to you quickly.` },
      { kind: 'note', text: `You can also ask me with a tool's name, a size, or the job you need it for.` },
    ];
    return this.reply('unknown', blocks, this.starterSuggestions(), [
      { kind: 'whatsapp', label: 'Ask the team on WhatsApp', text: raw },
      { kind: 'call', label: `Call ${this.company.phoneDisplay}` },
      { kind: 'route', label: 'Browse categories', route: '/categories' },
    ], [], ctx);
  }

  /**
   * A product we don't list exactly. Never "we don't have it": the customer is asked to contact the team (who can
   * often arrange it), with their request already written into the WhatsApp message, plus related products when
   * there are real ones.
   */
  private unlistedReply(related: Product[], ctx: SidekickContext): Reply {
    const blocks: Block[] = [{ kind: 'text', text: `For this product, please contact our team — they'll check and get back to you quickly.` }];
    if (related.length) {
      blocks.push({ kind: 'text', text: 'Related products on our website:' });
      blocks.push({ kind: 'products', items: related.slice(0, 4).map((x) => this.ref(x)) });
    }
    blocks.push({ kind: 'note', text: 'Share the product name, size and quantity — the team will confirm availability and price.' });
    const actions: ReplyAction[] = [
      { kind: 'whatsapp', label: 'Ask the team on WhatsApp', text: requestText(this.lastQuestion), request: true },
      { kind: 'call', label: `Call ${this.company.phoneDisplay}` },
    ];
    if (!related.length) actions.push({ kind: 'route', label: 'Browse categories', route: '/categories' });
    const next: SidekickContext = related.length
      ? { ...ctx, products: related.map((p) => p.slug), category: related[0].category }
      : { ...ctx, products: [], category: undefined };
    const suggestions = related.length ? this.productSuggestions(related[0], 'info') : this.starterSuggestions();
    return this.reply('unlisted', blocks, suggestions, actions, related, next);
  }

  private simple(intent: Intent, text: string, ctx: SidekickContext): Reply {
    return this.reply(intent, [{ kind: 'text', text }], this.starterSuggestions(), [], [], ctx);
  }

  // ── Suggestions & actions ────────────────────────────────────────────────────────────────────────────────────

  private starterSuggestions(): Suggestion[] {
    return [
      { label: 'Do you have chain pulley blocks?', ask: 'Do you have chain pulley blocks?' },
      { label: 'What is a revolving centre used for?', ask: 'What is a revolving centre used for?' },
      { label: 'ER collet sizes', ask: 'What sizes of ER collet do you have?' },
      { label: 'Where is your shop?', ask: 'Where is your shop?' },
    ];
  }

  private productSuggestions(p: Product, current: Intent): Suggestion[] {
    const name = shortName(p.name);
    const all: [Intent, Suggestion][] = [
      ['uses', { label: `What is it used for?`, ask: `What is ${name} used for?` }],
      ['howto', { label: 'How to use it', ask: `How to use ${name}?` }],
      ['sizes', { label: 'Sizes', ask: `What sizes of ${name} do you have?` }],
      ['specs', { label: 'Specifications', ask: `Specifications of ${name}` }],
      ['price', { label: 'Price', ask: `Price of ${name}` }],
    ];
    return all.filter(([i]) => i !== current).map(([, s]) => s).slice(0, 4);
  }

  private productActions(p: Product, variant?: ProductVariant, note?: string): ReplyAction[] {
    return [
      { kind: 'whatsapp', label: note ? 'Ask the team on WhatsApp' : 'Get a quote on WhatsApp', slug: p.slug, variantId: variant?.id, text: note },
      { kind: 'route', label: 'View product', route: `/products/${p.slug}`, query: variant ? { variant: variant.id } : undefined },
    ];
  }

  private reply(
    intent: Intent,
    blocks: Block[],
    suggestions: Suggestion[],
    actions: ReplyAction[],
    products: Product[],
    ctx: SidekickContext,
  ): Reply {
    return {
      intent,
      blocks: blocks.map((b) => this.cleanBlock(b)),
      suggestions,
      actions,
      products: products.map((p) => p.slug),
      context: { ...ctx, products: ctx.products.slice(0, 6) },
    };
  }

  /** Last line of defence: no price figures and no lifting maker name in anything Sidekick says. */
  private cleanBlock(b: Block): Block {
    const clean = (t: string) => t.replace(MAKER, '').replace(/(₹|\brs\.?\s?)\s?\d[\d,]*(\.\d+)?(\s?\/-)?/gi, '').replace(/\s{2,}/g, ' ').trim();
    switch (b.kind) {
      case 'text':
      case 'note':
        return { ...b, text: clean(b.text) };
      case 'list':
        return { ...b, items: b.items.map(clean) };
      case 'facts':
        return { ...b, rows: b.rows.map((r) => ({ label: clean(r.label), value: clean(r.value) })) };
      default:
        return b;
    }
  }
}
