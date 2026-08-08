import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';

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

  // timer(0, 10000) emits immediately and then every 10 seconds.
  // switchMap takes each emission and triggers the API call.
  // What if I don't want a new request to start until the previous request finishes? exhaustMap
  users$ = timer(0, 10000).pipe(switchMap(() => this.getUsers()));

  // toSignal() subscribes to the Observable for you and automatically unsubscribes when the Angular component is destroyed.
  users = toSignal(this.users$, { initialValue: [] });

  getUsers() {
    return this.http.get<User[]>('https://jsonplaceholder.typicode.com/users');
  }
}
