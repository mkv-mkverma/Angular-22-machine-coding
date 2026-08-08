import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-user-filter',
  imports: [ReactiveFormsModule, AsyncPipe, CommonModule],
  templateUrl: './user-filter.html',
  styleUrl: './user-filter.scss',
})
export class UserFilter {
  private http = inject(HttpClient);

  // form control
  searchControl = new FormControl('');
  sortControl = new FormControl('firstName');
  statusControl = new FormControl('young');

  // stream
  search$ = this.searchControl.valueChanges.pipe(
    startWith(this.searchControl.value),
    debounceTime(500),
    distinctUntilChanged(),
  );

  sort$ = this.sortControl.valueChanges.pipe(
    startWith(this.sortControl.value),
    distinctUntilChanged(),
  );

  status$ = this.statusControl.valueChanges.pipe(
    startWith(this.statusControl.value),
    distinctUntilChanged(),
  );

  // combine the filter
  filter$ = combineLatest([this.search$, this.status$, this.sort$]);

  // API call
  user$ = this.filter$.pipe(
    switchMap(([search, status, sort]) =>
      this.getUserData(search ?? '').pipe(
        map((response) => {
          let users = response.users;

          // filter
          if (status === 'young') {
            // add any status-based logic here
            users = [...users].filter((e: any) => e.age < 30);
          }
          if (status === 'old') {
            users = [...users].filter((e: any) => e.age > 30);
          }

          // sort
          users = [...users].sort((a, b) => {
            if (sort === 'age') {
              return a.age - b.age;
            }

            return a.firstName.localeCompare(b.firstName);
          });

          return users;
        }),
      ),
    ),
  );

  getUserData(search: string = '') {
    //dummyjson.com/users/search?a=text
    https: return this.http.get<any>('https://dummyjson.com/users/search', {
      params: {
        q: search,
      },
    });
  }
}
