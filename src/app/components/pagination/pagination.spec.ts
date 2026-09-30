import { pageItems } from './pagination';

const render = (cur: number, total: number) =>
  pageItems(cur, total)
    .map((i) => (i.kind === 'page' ? String(i.n) : '…'))
    .join(' ');

describe('pageItems (pagination)', () => {
  it('lists every page when there are 7 or fewer', () => {
    expect(render(1, 1)).toBe('1');
    expect(render(3, 7)).toBe('1 2 3 4 5 6 7');
  });

  it('compacts long ranges around the current page', () => {
    expect(render(1, 22)).toBe('1 2 3 4 … 22');
    expect(render(10, 22)).toBe('1 … 9 10 11 … 22');
    expect(render(22, 22)).toBe('1 … 19 20 21 22');
  });

  it('never repeats or skips the first/last page', () => {
    for (let total = 1; total <= 40; total++) {
      for (let cur = 1; cur <= total; cur++) {
        const pages = pageItems(cur, total).filter((i) => i.kind === 'page').map((i) => (i as { n: number }).n);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(total);
        expect(new Set(pages).size).toBe(pages.length);
        expect(pages).toContain(cur);
      }
    }
  });
});
