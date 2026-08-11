import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Users } from '../../services/users';

@Component({
  selector: 'app-cached-api',
  imports: [],
  templateUrl: './cached-api.html',
  styleUrl: './cached-api.scss',
})
export class CachedApi {
  private destroyRef = inject(DestroyRef);
  private users = inject(Users);

  constructor(){
    // all API 4 times
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()

    this.users.getuserCashed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.users.getuserCashed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.users.getuserCashed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
