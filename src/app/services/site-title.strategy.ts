import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { COMPANY } from '../config/company.config';
import { SeoData, SeoService } from './seo.service';

/**
 * "<Page> | Steel Tools India" for every route (bare brand name when a route has no title),
 * plus description / Open Graph / canonical from the deepest route's `data.seo`.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    const full = page ? `${page} | ${COMPANY.name}` : `${COMPANY.name} | ${COMPANY.tagline}`;
    this.title.setTitle(full);

    let route: ActivatedRouteSnapshot = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    this.seo.apply(full, snapshot.url, route.data['seo'] as SeoData | undefined);
  }
}
