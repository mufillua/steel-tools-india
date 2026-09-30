export type CategoryIcon =
  | 'taper'
  | 'centre'
  | 'hand-tool'
  | 'solid-carbide'
  | 'indexable'
  | 'hss'
  | 'carbide-tipped'
  | 'pliers'
  | 'spanner'
  | 'socket'
  | 'screwdriver'
  | 'hammer'
  | 'toolbox'
  | 'disc'
  | 'non-sparking';

export interface Category {
  slug: string;
  name: string;
  /** Short factual description built only from the product groups present in the source PDFs. */
  description: string;
  icon: CategoryIcon;
  /** Manufacturer brand(s) whose supplied price lists this category is drawn from. */
  brands: string[];
  /** Which supplied document(s) the category comes from — kept for traceability. */
  sources: string[];
  /** Representative sub-groups, as named in the source documents. */
  highlights: string[];
}

export interface CategoryWithCount extends Category {
  productCount: number;
}
