import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { retry } from 'rxjs';

@Component({
  selector: 'app-retry',
  imports: [],
  templateUrl: './retry.html',
  styleUrl: './retry.scss',
})
export class Retry {
  private http = inject(HttpClient);

  user$ = this.getUser()
    // retry(n) resubscribes to the Observable when an error occurs, up to n times.
    .pipe(retry({ count: 7, delay: 2000 }))
    .subscribe({
      next: (res) => console.log(res),
      error: (e) => console.log(e),
      complete: () => console.log('Completed'),
    });

  getUser() {
    return this.http.get('https://dummyjson.com/useoors/1');
  }
}
