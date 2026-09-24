import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PRODUCT_SEARCH_URL, ProductSearchResponse, SignalAutocomplete } from './signal-autocomplete';

describe('SignalAutocomplete', () => {
  let component: SignalAutocomplete;
  let fixture: ComponentFixture<SignalAutocomplete>;
  let httpMock: HttpTestingController;

  const response: ProductSearchResponse = {
    products: [
      { id: 1, title: 'iPhone 9', description: 'An apple phone', price: 549, thumbnail: 'a.png' },
      { id: 2, title: 'Galaxy', description: 'A samsung phone', price: 499, thumbnail: 'b.png' },
    ],
    total: 2,
    skip: 0,
    limit: 30,
  };

  const search = async (text: string) => {
    component.searchText.set(text);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
  };

  const settle = async () => {
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [SignalAutocomplete],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalAutocomplete);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('should create without firing a request', () => {
    expect(component).toBeTruthy();
    httpMock.expectNone(() => true);
    expect(fixture.nativeElement.textContent).toContain('Start typing to search products.');
  });

  it('should search products after debounce and render them', async () => {
    await search('phone');

    const req = httpMock.expectOne(`${PRODUCT_SEARCH_URL}?q=phone`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
    await settle();

    expect(component.products().length).toBe(2);
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('iPhone 9');
    expect(fixture.nativeElement.textContent).toContain('2 result(s)');
  });

  it('should not fire a request for whitespace-only input', async () => {
    await search('   ');
    httpMock.expectNone(() => true);
  });

  it('should show an error message when the request fails', async () => {
    await search('phone');

    httpMock
      .expectOne(`${PRODUCT_SEARCH_URL}?q=phone`)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
  });
});
