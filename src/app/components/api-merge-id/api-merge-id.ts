import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-api-merge-id',
  imports: [],
  templateUrl: './api-merge-id.html',
  styleUrl: './api-merge-id.scss',
})
export class ApiMergeId {
  private http = inject(HttpClient);

  userData = forkJoin({
    users: this.getUsers(),
    photos: this.getPhotos(),
  })
    .pipe(
      map(({ users, photos }) => {
        return users.map((user: any) => {
          return {
            ...user,
            ...photos.find((p) => p.id === user.id),
          };
        });
      }),
    )
    .subscribe(console.log);

  /**
 * Optimized for Large Data use Map Lookup

find() inside map() has O(n²) complexity.
Create Map -> O(n) Lookup -> O(1) Overall = O(n)

 */

  userDataByMap = forkJoin({
    users: this.getUsers(),
    photos: this.getPhotos(),
  })
    .pipe(
      map(({ users, photos }) => {
        return users.map((user: any) => {
          const ph = new Map(photos.map((p) => [p.id, p]));

          return {
            ...user,
            ...ph.get(user.id),
          };
        });
      }),
    )
    .subscribe(console.log);

  getUsers() {
    return this.http.get<any[]>(`https://jsonplaceholder.typicode.com/users`);
  }

  getPhotos() {
    return this.http.get<any[]>(`https://jsonplaceholder.typicode.com/photos`);
  }
}
