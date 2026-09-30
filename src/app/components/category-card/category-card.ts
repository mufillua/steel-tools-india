import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryWithCount } from '../../models/category.model';
import { CategoryIcon } from '../category-icon/category-icon';
import { Icon } from '../icon/icon';

@Component({
  selector: 'sti-category-card',
  imports: [RouterLink, CategoryIcon, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss',
})
export class CategoryCard {
  readonly category = input.required<CategoryWithCount>();
  /** Two-digit index printed in the corner, like a drawing reference. */
  readonly index = input(0);
  /** While the catalogue loads, counts are hidden rather than shown as 0. */
  readonly countsReady = input(true);
}
