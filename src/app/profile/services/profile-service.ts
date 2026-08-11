import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { IUser } from '../models/user';

@Service()
export class ProfileService {
  private http = inject(HttpClient);

  private readonly cache = new Map<number, Observable<IUser>>();

  getUser(userId: number) {
    return this.http.get<IUser>(`https://dummyjson.com/users/${userId}`);
  }

  getCachedUser(userId:number): Observable<IUser> {
    const cachedUser = this.cache.get(userId);

    if (cachedUser) {
      return cachedUser;
    }

    const user$ = this.getUser(userId).pipe(
      catchError((error) => {
        this.cache.delete(userId);
        return throwError(() => error);
      }),
      shareReplay(1),
    );
    this.cache.set(userId, user$);
    return user$;
  }

  updateUser(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(`https://jsonplaceholder.typicode.com/users/${user.id}`, user).pipe(
      tap((updatedUser) => {
        this.cache.set(updatedUser.id, of(updatedUser));
      }),
    );
  }
}
