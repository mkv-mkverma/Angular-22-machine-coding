import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, from, mergeMap, of, toArray } from 'rxjs';

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
  private http = inject(HttpClient);

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
}
