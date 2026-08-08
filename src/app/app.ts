import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExhaustMap } from './components/exhaust-map/exhaust-map';
import { CombineLatest } from './components/combine-latest/combine-latest';
import { UserFilter } from './components/user-filter/user-filter';
import { ShortPolling } from './components/short-polling/short-polling';

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
    ShortPolling
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-22-machine-coding');
}
