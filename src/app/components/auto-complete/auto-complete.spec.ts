import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AutoComplete } from './auto-complete';

describe('AutoComplete', () => {
  let component: AutoComplete;
  let fixture: ComponentFixture<AutoComplete>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoComplete],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoComplete);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('searches after trimming a query and exposes matching products', () => {
    vi.useFakeTimers();
    try {
      component.searchControl.setValue('  laptop  ');
      vi.advanceTimersByTime(500);
      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({
        products: [{ id: 1, title: 'Laptop' }],
      });

      expect(component.productList()?.[0].title).toBe('Laptop');
    } finally {
      vi.useRealTimers();
    }
  });

  it('gets products with an encoded search query', () => {
    component.getProductList('phone case').subscribe();
    httpMock.expectOne('https://dummyjson.com/products/search?q=phone%20case').flush({ products: [] });
  });

  it('renders a list item per matching product', () => {
    vi.useFakeTimers();
    try {
      component.searchControl.setValue('laptop');
      vi.advanceTimersByTime(500);
      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({
        products: [{ id: 1, title: 'Laptop' }],
      });

      fixture.detectChanges();
      const items: NodeListOf<HTMLLIElement> = fixture.nativeElement.querySelectorAll('li');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('Laptop');
    } finally {
      vi.useRealTimers();
    }
  });
});
