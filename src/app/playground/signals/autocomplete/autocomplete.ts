import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { form, minLength, pattern, required, FormField } from '@angular/forms/signals';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

export interface IProducts {
  id: number;
  title: string;
}

export interface APIResponse {
  products: IProducts[];
}

@Component({
  selector: 'app-autocomplete',
  imports: [FormField],
  templateUrl: './autocomplete.html',
  styleUrl: './autocomplete.scss',
})
export class Autocomplete {
  private readonly http = inject(HttpClient);
  search = signal<string>('');
  isloading = signal<boolean>(false);
  searchForm = form(this.search, (schema) => {
    required(schema);
    minLength(schema, 2);
    pattern(schema, /^[A-Za-z ]+$/);
  });

  products$ = toObservable(this.search).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map((search) => search.trim()),
    switchMap((search) => {
      if (!search) {
        this.isloading.set(false);
        return of([]);
      }
      this.isloading.set(true);
      return this.getProducts(search).pipe(
        map((res) => res.products),
        catchError(() => of([])),
        finalize(() => this.isloading.set(false)),
      );
    }),
  );

  products = toSignal(this.products$, { initialValue: [] });

  
  getProducts(searchText: string): Observable<APIResponse> {
    return this.http.get<APIResponse>(`https://dummyjson.com/products/search?q=${searchText}`);
  }
}
