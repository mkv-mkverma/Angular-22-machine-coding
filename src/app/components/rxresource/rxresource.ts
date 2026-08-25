import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

interface ProductSearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

@Component({
  selector: 'app-rxresource',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rxresource.html',
  styleUrl: './rxresource.scss',
})
export class Rxresource {
  private readonly http = inject(HttpClient);
  search = signal<string>('');
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: this.search() },
  );
  productsResource = rxResource({
    params: () => ({ search: this.debouncedSearch() }),
    stream: ({ params }) =>
      this.http.get<ProductSearchResponse>(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(params.search)}`,
      ),
  });
}
