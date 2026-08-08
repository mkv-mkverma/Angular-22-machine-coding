import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from 'rxjs';

interface Product {
  id: number;
  title: string;
  [key: string]: unknown;
}

interface ProductSearchResponse {
  products: Product[];
}

@Component({
  selector: 'app-auto-complete',
  imports: [ReactiveFormsModule],
  templateUrl: './auto-complete.html',
  styleUrl: './auto-complete.scss',
})
export class AutoComplete {
  private http = inject(HttpClient);

  searchControl = new FormControl('', { nonNullable: true });

  product$ = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    map((value) => value.trim()),
    distinctUntilChanged(),
    filter((e) => e.length > 2),
    switchMap((value) =>
      value ? this.getProductList(value) : of<ProductSearchResponse>({ products: [] }),
    ),
    map((response) => response.products),
  );

  productList = toSignal(this.product$);

  getProductList(searchText: string) {
    return this.http.get<ProductSearchResponse>(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(searchText)}`,
    );
  }
}
