import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';

/**
 * Angular HttpClient observables are cold, so every subscription starts a new HTTP request.
 * I store one shared observable in the service
 * and use shareReplay(1) to share the request and cache its latest response.
 * I invalidate that cache after data-changing operations or when a refresh is required.
 */
interface User {
  name: string;
  id: number;
}

/**
 * HELPFUL: The @Service decorator is an ergonomic shorthand for
 * @Injectable({providedIn: 'root'}).
 */
@Service()
export class Users {
  private http = inject(HttpClient);
  private user$?: Observable<User[]>;

  getUsers() {
    return this.http.get<User[]>('https://jsonplaceholder.typicode.com/users');
  }

  getuserCashed(): Observable<User[]> {
    if (!this.user$) {
      // bufferSize: 1 retains the most recent API response for future subscribers.
      // Even if the component unsubscribes, refCount: false keeps the shared observable/cache alive in the service.
      this.user$ = this.getUsers().pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.user$;
  }

  refreshUsers(): void {
    this.user$ = undefined;
  }

  // explicitly refresh or invalidate the cache.
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`/api/users/${user.id}`, user).pipe(tap(() => this.refreshUsers()));
  }
}
