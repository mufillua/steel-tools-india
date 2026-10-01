import { ProductVariant } from '../models/product.model';

/** Helpers that turn catalogue tables into variant lists without hand-writing every row. */

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/["″]/g, 'in')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function variant(attributes: Record<string, string>): ProductVariant {
  const values = Object.values(attributes);
  return { id: slug(values.join(' ')), label: values.join(' · '), attributes };
}

/** One axis: ['MT-1','MT-2'] → 2 variants. */
export function single(axis: string, values: string[]): ProductVariant[] {
  return values.map((v) => variant({ [axis]: v }));
}

/** Full cross product of two axes (only use when every combination is listed in the source). */
export function cross(a: [string, string[]], b: [string, string[]]): ProductVariant[] {
  return a[1].flatMap((av) => b[1].map((bv) => variant({ [a[0]]: av, [b[0]]: bv })));
}

/** Explicit rows: axes + rows of values in the same order. Optional custom label per row. */
export function rows(
  axes: string[],
  data: string[][],
  label?: (a: Record<string, string>) => string,
): ProductVariant[] {
  return data.map((r) => {
    const attributes = Object.fromEntries(axes.map((a, i) => [a, r[i]]));
    if (!label) return variant(attributes);
    const l = label(attributes);
    return { id: slug(l), label: l, attributes };
  });
}

/**
 * Rows with a ready-made label per row (e.g. "CBST0103 · 1 t"). Ids come from the labels and are made unique.
 */
export function labelled(axes: string[], data: string[][], labels: string[]): ProductVariant[] {
  const seen = new Map<string, number>();
  return data.map((r, i) => {
    const attributes = Object.fromEntries(axes.map((a, j) => [a, r[j]]));
    const label = labels[i];
    let id = slug(label) || 'item';
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    return { id, label, attributes };
  });
}

/**
 * Taparia tables: the first column is the Taparia product number. The label is the product number plus up to two
 * short attributes (and the material/finish option, shortened to its code), e.g. "1170/1170N · 150 · Chrome plated".
 * Long cells (set contents, descriptions) stay in the table but are kept out of the label. Ids are made unique.
 */
export function tapariaVariants(axes: string[], data: string[][]): ProductVariant[] {
  const seen = new Map<string, number>();
  const LONG = 18;
  return data.map((r) => {
    const attributes = Object.fromEntries(axes.map((a, i) => [a, r[i]]));
    const [code, ...rest] = r;
    const opt = axes.length > 1 && /^(Material|Finish)$/.test(axes[axes.length - 1]) ? rest.pop() : undefined;
    const extra = rest.filter((v) => v && v !== '—' && v.length <= LONG).slice(0, 2);
    const optShort = opt ? (opt.match(/\(([A-Z]{2}-[A-Z]{2})\)/)?.[1] ?? opt) : undefined;
    const label = [code, ...extra, ...(optShort ? [optShort] : [])].join(' · ');
    let id = slug(label) || 'item';
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    return { id, label, attributes };
  });
}
