import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Users } from './services/users';
import { Header } from './header/header/header';
import { Footer } from './footer/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-22-machine-coding');
  private userService = inject(Users);

  // user$ = this.userService.getUsers().subscribe()
  user$ = this.userService.getuserCashed().subscribe();
}
