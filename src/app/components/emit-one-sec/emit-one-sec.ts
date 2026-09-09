import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  concatMap,
  debounceTime,
  delay,
  distinctUntilChanged,
  from,
  of,
  startWith,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-emit-one-sec',
  imports: [ReactiveFormsModule],
  templateUrl: './emit-one-sec.html',
  styleUrl: './emit-one-sec.scss',
})
export class EmitOneSec {
  searchControl = new FormControl('', { nonNullable: true });

  searchControl$ = this.searchControl.valueChanges
    .pipe(
      startWith(this.searchControl.value),
      debounceTime(300),
      distinctUntilChanged(),
      // map((e) => e.split('').reverse().join('')),
      switchMap((search) => from(search).pipe(concatMap((char) => of(char).pipe(delay(1000))))),
    )
    .subscribe(console.log);
}
