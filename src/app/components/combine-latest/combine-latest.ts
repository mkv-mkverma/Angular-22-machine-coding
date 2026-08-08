import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  combineLatest,
  combineLatestWith,
  debounceTime,
  from,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-combine-latest',
  imports: [ReactiveFormsModule],
  templateUrl: './combine-latest.html',
  styleUrl: './combine-latest.scss',
})
export class CombineLatest {
  emailControl = new FormControl('');
  passwordControl = new FormControl('');

  // combineLatest combines the latest value from each observable and emits whenever any observable emits, after every observable has emitted at least once.

  data$ = combineLatest([
    this.emailControl.valueChanges.pipe(
      startWith(''),
      catchError(() => of([])),
    ),
    this.passwordControl.valueChanges.pipe(
      startWith(''),
      catchError(() => of([])),
    ),
  ]).pipe(debounceTime(500));

  constructor() {
    this.data$.subscribe({
      next: (value) => console.log(value),
      error: (e) => console.log(e),
      complete: () => console.log('Completed'),
    });
  }
}
