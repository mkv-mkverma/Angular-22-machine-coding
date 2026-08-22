import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';
import { API_URL } from '../core/tokens/api-url.token';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-short-polling',
  imports: [],
  templateUrl: './short-polling.html',
  styleUrl: './short-polling.scss',
})
export class ShortPolling {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // timer(0, 10000) emits immediately and then every 10 seconds.
  // switchMap takes each emission and triggers the API call.
  // What if I don't want a new request to start until the previous request finishes? exhaustMap
  users$ = timer(0, 10000).pipe(switchMap(() => this.getUsers()));

  // stop polloing on user naviage, takeUntilDestroyed() isn't required when you're using toSignal(), because toSignal() owns and cleans up its subscription.

  // toSignal() subscribes to the Observable for you and automatically unsubscribes when the Angular component is destroyed.
  users = toSignal(this.users$, { initialValue: [] });

  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // stop polloing on user naviage

  // private destroyRef = inject(DestroyRef);


/**
 * takeUntilDestroyed() is called inside Angular's injection context 
 * (like a component constructor/field initializer), 
 * Angular's DI system knows the current component and its DestroyRef.
 */

  // users$
  //   .pipe(
  //     takeUntilDestroyed()
  //   )
  //   .subscribe(data => {
  //     console.log(data);
  //   });

  // or

  // ngOnInit() {
  //   timer(0, 1000)
  //     .pipe(
  //       switchMap(() => this.http.get('https://dummyjson.com/users/1')),
  //       takeUntilDestroyed(this.destroyRef)
  //     )
  //     .subscribe({
  //       next: data => console.log(data),
  //       error: err => console.log(err)
  //     });
  // }
}
