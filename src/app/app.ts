import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExhaustMap } from './components/exhaust-map/exhaust-map';
import { CombineLatest } from './components/combine-latest/combine-latest';
import { UserFilter } from './components/user-filter/user-filter';
import { ShortPolling } from './components/short-polling/short-polling';
import { CachedApi } from './components/cached-api/cached-api';
import { Users } from './services/users';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    // AutoComplete,
    // ApiMergeId,
    // SequenceApiCall,
    // MergeMap,
    ExhaustMap,
    CombineLatest,
    UserFilter,
    ShortPolling,
    CachedApi,
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
