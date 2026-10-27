import { COMPANY } from '../../config/company.config';
import { CATEGORIES } from '../../data/categories';
import { ALL_PRODUCTS } from '../../data/products';
import { requestText, SidekickEngine } from './engine';
import { normalize, sizeTokens, stem } from './text';
import { Reply, SidekickContext, SidekickKnowledge } from './types';

const text = (r: Reply) => JSON.stringify(r.blocks).toLowerCase();

describe('Sidekick engine', () => {
  let engine: SidekickEngine;
  let knowledge: SidekickKnowledge;

  beforeAll(async () => {
    knowledge = await (await fetch('/assets/sidekick/knowledge.json')).json();
    engine = new SidekickEngine(ALL_PRODUCTS, CATEGORIES, knowledge, {
      name: COMPANY.name,
      city: COMPANY.city,
      foundedYear: COMPANY.foundedYear,
      phoneDisplay: COMPANY.phoneDisplay,
      whatsappDisplay: COMPANY.whatsappDisplay,
      email: COMPANY.email,
      addressLines: COMPANY.address.lines,
      pincode: COMPANY.address.pincode,
      hours: COMPANY.hours,
    });
  });

  it('normalises codes, units and plurals the same way for questions and catalogue', () => {
    expect(normalize('ER-32 collet 10mm')).toBe('er32 collet 10 mm');
    expect(normalize('BT 40')).toBe('bt40');
    expect(normalize('Screw Drivers')).toBe('screwdriver');
    expect(stem('lifting')).toBe('lift');
    expect(stem('centres')).toBe('centre');
    expect(sizeTokens('chain block 2 t')[0]).toEqual(jasmine.objectContaining({ value: 2, unit: 't' }));
  });

  it('has a usage guide for every product', () => {
    for (const p of ALL_PRODUCTS) expect(knowledge.productGuide[p.slug]).withContext(p.slug).toBeTruthy();
  });

  it('finds products from customer words and follows up on them', () => {
    let r = engine.answer('chain kuppi');
    expect(r.products[0]).toContain('chain-pulley-block');
    r = engine.answer('how to use it', r.context);
    expect(r.intent).toBe('howto');
    expect(text(r)).toContain('hand chain');
  });

  it('checks a size against the size table', () => {
    const r = engine.answer('ER32 collet 10 mm');
    expect(r.intent).toBe('sizes');
    expect(r.products[0]).toBe('er-collet');
    expect(text(r)).toContain('er-32');
    const pallet = engine.answer('hand pallet truck 5000 kg');
    expect(text(pallet)).toContain('hpt50685');
  });

  it('never quotes a price — it hands over to WhatsApp', () => {
    const r = engine.answer('price of hand pallet truck');
    expect(r.intent).toBe('price');
    expect(r.actions.some((a) => a.kind === 'whatsapp')).toBeTrue();
    for (const q of ['price', 'rate of chain block', 'kitne ka hai', 'how much does a torque wrench cost']) {
      expect(/₹|\brs\.?\s?\d/.test(text(engine.answer(q)))).withContext(q).toBeFalse();
    }
  });

  it('never names the lifting range maker', () => {
    const r = engine.answer('do you sell safelift products');
    expect(/safe\s?lift|saif/.test(text(r))).toBeFalse();
    expect(r.intent).toBe('categories');
    for (const p of knowledge.passages) expect(/safe\s?lift(?!ing)|saif/i.test(p.t)).withContext(p.t).toBeFalse();
  });

  it('answers shop details from the company settings', () => {
    expect(text(engine.answer('where is your shop'))).toContain('n. s. road');
    expect(text(engine.answer('are you open on sunday'))).toContain('closed');
    expect(engine.answer('talk to a person').intent).toBe('human');
  });

  it('never says "we don\'t have it" — sends the customer to the team, with related products only when they fit', () => {
    const noWay = /couldn.t find|can.t find|don.t have|do not have|not in our catalogue|not available|we don.t (sell|stock|carry)/;
    for (const q of ['xyzzy flibber', 'do you have angle grinder', 'do you have welding machine', 'paint brush', 'ER32 collet 30mm']) {
      const r = engine.answer(q);
      expect(text(r)).withContext(q).toContain('contact our team');
      expect(noWay.test(text(r))).withContext(q).toBeFalse();
      expect(r.actions.some((a) => a.kind === 'whatsapp')).withContext(q).toBeTrue();
    }
    // Not the same kind of item → no unrelated products offered.
    const grinder = engine.answer('do you have angle grinder');
    expect(grinder.intent).toBe('unlisted');
    expect(grinder.blocks.some((b) => b.kind === 'products')).toBeFalse();
    // The same kind of item → shown as related, and the request goes into the WhatsApp message.
    const caliper = engine.answer('do you have vernier caliper');
    expect(caliper.intent).toBe('unlisted');
    expect(caliper.products[0]).toContain('caliper');
    expect(caliper.actions[0]).toEqual(jasmine.objectContaining({ kind: 'whatsapp', request: true, text: 'vernier caliper' }));
    // Real products are still answered directly.
    expect(engine.answer('do you have ER collet set').products[0]).toBe('er-collet-set');
  });

  it('turns the question into a request for the WhatsApp message', () => {
    expect(requestText('Do you have a vernier caliper?')).toBe('vernier caliper');
    expect(requestText('hi, do you sell bosch drills')).toBe('bosch drills');
    expect(requestText('I need angle grinder 4 inch')).toBe('angle grinder 4 inch');
  });

  it('does not reuse the previous product for an unrelated question', () => {
    const first = engine.answer('spring balancer');
    const ctx: SidekickContext = first.context;
    const r = engine.answer('open on sunday?', ctx);
    expect(r.intent).toBe('hours');
  });
});
