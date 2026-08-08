import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { exhaustMap, interval, map, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-short-polling',
  imports: [],
  templateUrl: './short-polling.html',
  styleUrl: './short-polling.scss',
})
export class ShortPolling {
  private http = inject(HttpClient);

  // timer(0, 10000) emits immediately and then every 10 seconds.
  // switchMap takes each emission and triggers the API call.
  // What if I don't want a new request to start until the previous request finishes? exhaustMap
  users$ = timer(0, 10000).pipe(switchMap((e) => this.getUsers()));

  // toSignal() subscribes to the Observable for you and automatically unsubscribes when the Angular component is destroyed.
  users = toSignal(this.users$, { initialValue: [] });

  constructor() {}
  getUsers() {
    return this.http.get<any[]>('https://jsonplaceholder.typicode.com/users');
  }
}
