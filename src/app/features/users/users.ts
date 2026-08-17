import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

export interface IUserMe {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private auth = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    // TEMP: lets us corrupt the token from DevTools console. Remove once Phase 4/5 testing is done.
    (window as unknown as { auth: Auth }).auth = this.auth;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  userMeData = toSignal<IUserMe>(this.getMe());

  callMe() {
    this.getMe().subscribe(console.log);
  }

  fireFive() {
    for (let i = 0; i < 5; i++) {
      this.getMe().subscribe(console.log);
    }
  }

  getMe() {
    return this.http.get<IUserMe>('https://dummyjson.com/auth/me');
  }
}
