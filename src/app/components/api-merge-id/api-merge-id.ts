import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';

interface User {
  id: number;
  [key: string]: unknown;
}

interface Photo {
  id: number;
  [key: string]: unknown;
}

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
    users: this.getUsers().pipe(catchError(() => of<User[]>([]))),
    photos: this.getPhotos().pipe(catchError(() => of<Photo[]>([]))),
  })
    .pipe(
      map(({ users, photos }) => {
        const photosById = new Map(photos.map((photo) => [photo.id, photo]));

        return users.map((user) => {

          return {
            ...user,
            //  ...(photos.find((p) => p.id === user.id) ?? null),
            ...(photosById.get(user.id) ?? {}),
          };
        });
      }),
    )
    .subscribe(console.log);

  getUsers() {
    return this.http.get<User[]>('https://jsonplaceholder.typicode.com/users');
  }

  getPhotos() {
    return this.http.get<Photo[]>('https://jsonplaceholder.typicode.com/photos');
  }
}
