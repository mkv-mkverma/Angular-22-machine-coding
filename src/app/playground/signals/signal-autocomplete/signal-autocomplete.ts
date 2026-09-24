import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const PRODUCT_SEARCH_URL = 'https://dummyjson.com/products/search';

@Component({
  selector: 'app-signal-autocomplete',
  imports: [],
  templateUrl: './signal-autocomplete.html',
  styleUrl: './signal-autocomplete.scss',
})
export class SignalAutocomplete {
  searchText = signal<string>('');

  // Debounce keystrokes so a request isn't fired per character.
  private readonly debouncedSearch = toSignal(
    toObservable(this.searchText).pipe(
      map((text) => text.trim()),
      debounceTime(300),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  // Re-fetches whenever debouncedSearch changes and cancels the previous
  // in-flight request. Returning undefined keeps the resource idle.
  productsResource = httpResource<ProductSearchResponse>(() => {
    const searchText = this.debouncedSearch();
    return searchText
      ? `${PRODUCT_SEARCH_URL}?q=${encodeURIComponent(searchText)}`
      : undefined;
  });

  products = computed(() => this.productsResource.value()?.products ?? []);
  total = computed(() => this.productsResource.value()?.total ?? 0);

  onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  clear(): void {
    this.searchText.set('');
  }
}
