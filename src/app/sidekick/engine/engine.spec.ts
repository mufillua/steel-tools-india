import { COMPANY } from '../../config/company.config';
import { CATEGORIES } from '../../data/categories';
import { ALL_PRODUCTS } from '../../data/products';
import { SidekickEngine } from './engine';
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

  it('says so when it cannot find something, instead of guessing', () => {
    const r = engine.answer('xyzzy flibber');
    expect(r.intent).toBe('unknown');
    const close = engine.answer('do you have vernier caliper');
    expect(text(close)).toContain('closest');
  });

  it('does not reuse the previous product for an unrelated question', () => {
    const first = engine.answer('spring balancer');
    const ctx: SidekickContext = first.context;
    const r = engine.answer('open on sunday?', ctx);
    expect(r.intent).toBe('hours');
  });
});
