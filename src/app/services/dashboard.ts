import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class Dashboard {
  private http = inject(HttpClient);

  getUsers(id = 1) {
    return this.http.get<unknown[]>(`https://jsonplaceholder.typicode.com/users/${id}`);
  }

  getPermissions() {
    return this.http.get<unknown[]>('https://jsonplaceholder.typicode.com/todos?_limit=3');
  }

  getFeatures() {
    return this.http.get<unknown[]>('https://jsonplaceholder.typicode.com/posts?_limit=3');
  }
}
