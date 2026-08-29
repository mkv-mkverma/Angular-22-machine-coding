import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { retry, throwError, timer } from 'rxjs';

@Component({
  selector: 'app-retry-when',
  imports: [],
  templateUrl: './retry-when.html',
  styleUrl: './retry-when.scss',
})
export class RetryWhen {
  private http = inject(HttpClient);

  // user$ = this.getUser().pipe(retry({count:1, delay:1000}));
  user$ = this.getUser().pipe(
    retry({
      count: 3,
      delay: (error) => {
        // delay: (error, retryCount) => {
        // console.log(retryCount, error.status);
        // ❌ 404 → don't retry
        if (error.status === 404) {
          return throwError(() => error);
        }
        return timer(1000);
      },
    }),
  );

  getUser() {
    return this.http.get('https://dummyjson.com/users/1');
  }

  constructor() {
    this.user$.subscribe({
      next: (r) => console.log(r),
      error: (e) => console.log(e),
      complete: () => console.log('Completed'),
    });
  }
}
