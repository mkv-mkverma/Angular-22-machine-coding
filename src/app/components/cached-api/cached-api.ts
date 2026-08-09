import { Component, inject } from '@angular/core';
import { Users } from '../../services/users';

@Component({
  selector: 'app-cached-api',
  imports: [],
  templateUrl: './cached-api.html',
  styleUrl: './cached-api.scss',
})
export class CachedApi {
  private users = inject(Users)

  constructor(){
    // all API 4 times
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()
    // this.users.getUsers().subscribe()

    this.users.getuserCashed().subscribe()
    this.users.getuserCashed().subscribe()
    this.users.getuserCashed().subscribe()
  }
}
