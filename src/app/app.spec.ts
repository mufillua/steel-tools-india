import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { COMPANY } from './config/company.config';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the exact navbar: Products, Categories, About Us, Ph. No., Get A Quote', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const nav = el.querySelector('.hdr__nav')!;
    const text = nav.textContent!.replace(/\s+/g, ' ');
    const order = ['Products', 'Categories', 'About Us', 'Ph. No.', 'Get A Quote'].map((t) => text.indexOf(t));
    expect(order.every((i) => i >= 0)).toBeTrue();
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(el.querySelector(`a[href="tel:${COMPANY.phoneE164}"]`)).toBeTruthy();
  });

  it('has a skip link and a main landmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.skip-link[href="#main"]')).toBeTruthy();
    expect(el.querySelector('main#main')).toBeTruthy();
  });
});
