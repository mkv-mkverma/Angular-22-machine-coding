import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-auto-complete',
  imports: [ReactiveFormsModule],
  templateUrl: './auto-complete.html',
  styleUrl: './auto-complete.scss',
})
export class AutoComplete {
  private http = inject(HttpClient);

  searchControl = new FormControl();

  product$ = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    map((value: any) => value.trim()),
    distinctUntilChanged(),
    filter((e) => e.length > 2),
    switchMap((v) => (v ? this.getProductList(v) : of([]))),
    map((e: any) => e.products),
  );

  productList = toSignal(this.product$);

  getProductList(searchText: string) {
    return this.http.get<any[]>(`https://dummyjson.com/products/search?q=${searchText}`);
  }
}
