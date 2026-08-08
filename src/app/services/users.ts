import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
/**
 * HELPFUL: The @Service decorator is an ergonomic shorthand for
 * @Injectable({providedIn: 'root'}).
 */
@Service()
export class Users {
  private http = inject(HttpClient);

  getUsers() {
    return this.http.get('https://jsonplaceholder.typicode.com/users');
  }
}
