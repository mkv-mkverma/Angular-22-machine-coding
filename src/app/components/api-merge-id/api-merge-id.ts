import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-api-merge-id',
  imports: [],
  templateUrl: './api-merge-id.html',
  styleUrl: './api-merge-id.scss',
})
export class ApiMergeId {
  private http = inject(HttpClient);
  /**
   * Paralle Independent API call
 * Optimized for Large Data use Map Lookup

find() inside map() has O(n²) complexity.
Create Map -> O(n) Lookup -> O(1) Overall = O(n)

 */

  userDataByMap = forkJoin({
    users: this.getUsers().pipe(catchError((e) => of([]))),
    photos: this.getPhotos().pipe(catchError((e) => of([]))),
  })
    .pipe(
      map(({ users, photos }) => {
        return users.map((user: any) => {
          const ph = new Map(photos.map((p) => [p.id, p]));

          return {
            ...user,
            //  ...(photos.find((p) => p.id === user.id) ?? null),
            ...(ph.get(user.id) ?? []),
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
