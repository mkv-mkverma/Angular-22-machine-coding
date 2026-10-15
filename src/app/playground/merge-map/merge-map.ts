import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, from, mergeMap, of, scan, tap, toArray } from 'rxjs';

interface UserSummary {
  id: number;
}

interface UsersResponse {
  users: UserSummary[];
}

@Component({
  selector: 'app-merge-map',
  imports: [],
  templateUrl: './merge-map.html',
  styleUrl: './merge-map.scss',
})
export class MergeMap {
  private readonly http = inject(HttpClient);

  getUser() {
    return this.http.get<UsersResponse>('https://dummyjson.com/users');
  }

  getUserById(id: number) {
    return this.http.get(`https://dummyjson.com/users/${id}`);
  }

  // how to call All users by Id

  // mergeMap subscribes to every inner observable immediately.
  // All inner observables run concurrently, and their results can arrive in any order.
  // Ex: Infinite scroll, Multiple API calls, Save multiple records, Download multiple files

  data = this.getUser()
    .pipe(
      // `user.users` is an array; `from` converts it into an observable that
      // emits each user individually, allowing the next `mergeMap` to call
      // `getUserById` for every user.
      mergeMap((user) => from(user.users)),
      mergeMap((user) => this.getUserById(user.id).pipe(catchError(() => of([])))),
      toArray(),
      takeUntilDestroyed(),
    )
    .subscribe({
      next: (value) => console.log(value),
      error: (e) => console.log(e),
      complete: () => console.log('Completed'),
    });

  // Making sequence API call and delay

  runRequests() {
    const ids = Array.from({ length: 10 }, (_, i) => i + 1);
    const startTime = Date.now();

    console.log('Starting all requests...');

    from(ids)
      .pipe(
        // concatMap(id) and remove 10
        mergeMap((id) => {
          // First 5 calls: 1 second.
          // Next 5 calls: 5 seconds.
          const seconds = id <= 5 ? 1 : 5;

          console.log(`Request ${id} started`);

          return this.http.get<unknown>(`https://httpbin.org/delay/${seconds}?id=${id}`).pipe(
            tap(() => {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

              console.log(`Request ${id} completed at ${elapsed}s`);
            }),
          );
        }, 10), // Maximum 10 concurrent requests, add 3 then Maximum 10 concurrent requests
        scan((acc, response) => [...acc, response], [] as unknown[]), // kepp adding to ui
        // toArray(), // to give combine result

        finalize(() => console.log('All requests finished')),
      )
      .subscribe({
        next: (data) => console.log(data),
        error: (err) => console.error('API error:', err),
      });
  }
}
