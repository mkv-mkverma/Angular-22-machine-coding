import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  of,
  startWith,
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

  email$ = this.emailControl.valueChanges.pipe(
    startWith(this.emailControl.value),
    distinctUntilChanged(),
    catchError(() => of('')),
  );

  password$ = this.passwordControl.valueChanges.pipe(
    startWith(this.passwordControl.value),
    distinctUntilChanged(),
    catchError(() => of('')),
  );

  // combineLatest combines the latest value from each observable and emits whenever any observable emits, after every observable has emitted at least once.
  data$ = combineLatest([this.email$, this.password$]);

  constructor() {
    this.data$.subscribe({
      next: (value) => console.log(value),
      error: (e) => console.log(e),
      complete: () => console.log('Completed'),
    });
  }
}
