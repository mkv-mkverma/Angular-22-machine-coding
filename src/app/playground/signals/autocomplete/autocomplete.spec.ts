import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Autocomplete } from './autocomplete';

describe('Autocomplete', () => {
  let component: Autocomplete;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autocomplete],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // The component's `products$` (built from `toObservable(this.search).pipe(debounceTime(300), ...)`)
  // subscribes eagerly in the field initializer, i.e. at `TestBed.createComponent()` time. RxJS's
  // `debounceTime` schedules its work via the async scheduler, which resolves the global timer
  // functions at call time -- so fake timers must already be installed *before* the component (and
  // therefore the debounce subscription) is created, otherwise the scheduled work silently never
  // fires when the timers are later advanced. Tests that exercise the debounce/HTTP flow call
  // `vi.useFakeTimers()` first and create the fixture through this helper; simple sync tests use the
  // shared fixture from `beforeEach`.
  function createFixture() {
    const localFixture = TestBed.createComponent(Autocomplete);
    return { fixture: localFixture, component: localFixture.componentInstance };
  }

  beforeEach(() => {
    ({ component } = createFixture());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with no search text, not loading, and no products', () => {
    expect(component.search()).toBe('');
    expect(component.isloading()).toBe(false);
    expect(component.products()).toEqual([]);
  });

  it('builds the request URL from the raw search text', () => {
    component.getProducts('phone case').subscribe();

    const request = httpMock.expectOne('https://dummyjson.com/products/search?q=phone case');
    expect(request.request.method).toBe('GET');
    request.flush({ products: [] });
  });

  it('does not call the API and stays not-loading when the search is cleared/empty', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(500);

      httpMock.expectNone('https://dummyjson.com/products/search?q=');
      expect(local.component.isloading()).toBe(false);
      expect(local.component.products()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('debounces the search, trims it, and requests matching products', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('  laptop  ');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(299);
      httpMock.expectNone('https://dummyjson.com/products/search?q=laptop');

      vi.advanceTimersByTime(1);
      expect(local.component.isloading()).toBe(true);

      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({
        products: [{ id: 1, title: 'Laptop' }],
      });

      expect(local.component.products()).toEqual([{ id: 1, title: 'Laptop' }]);
      expect(local.component.isloading()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores repeated identical values via distinctUntilChanged (only one request fires)', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('laptop');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);
      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({ products: [] });

      // Setting the exact same (trimmed) value again should not trigger a second request.
      local.component.search.set('laptop');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);
      httpMock.expectNone('https://dummyjson.com/products/search?q=laptop');
    } finally {
      vi.useRealTimers();
    }
  });

  it('resolves to an empty product list and stops loading when the request errors', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('zzz');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);

      httpMock.expectOne('https://dummyjson.com/products/search?q=zzz').error(new ProgressEvent('error'));

      expect(local.component.products()).toEqual([]);
      expect(local.component.isloading()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the loading state while a request is in flight', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('laptop');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);
      local.fixture.detectChanges();

      expect(local.fixture.nativeElement.textContent).toContain('Loading...');

      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({
        products: [{ id: 1, title: 'Laptop' }],
      });
      local.fixture.detectChanges();

      expect(local.fixture.nativeElement.textContent).not.toContain('Loading...');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders a list item per matching product', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('laptop');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);
      httpMock.expectOne('https://dummyjson.com/products/search?q=laptop').flush({
        products: [{ id: 1, title: 'Laptop' }],
      });
      local.fixture.detectChanges();

      const items: NodeListOf<HTMLLIElement> = local.fixture.nativeElement.querySelectorAll('li');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('Laptop');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the empty state when no products match', () => {
    vi.useFakeTimers();
    try {
      const local = createFixture();
      local.component.search.set('zzz');
      local.fixture.detectChanges();
      vi.advanceTimersByTime(300);
      httpMock.expectOne('https://dummyjson.com/products/search?q=zzz').flush({ products: [] });
      local.fixture.detectChanges();

      expect(local.fixture.nativeElement.textContent).toContain('No Product');
    } finally {
      vi.useRealTimers();
    }
  });
});
