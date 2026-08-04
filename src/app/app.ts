import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoComplete } from './components/auto-complete/auto-complete';
import { ApiMergeId } from './components/api-merge-id/api-merge-id';
import { SequenceApiCall } from './components/sequence-api-call/sequence-api-call';
import { MergeMap } from './components/merge-map/merge-map';
import { ExhaustMap } from './components/exhaust-map/exhaust-map';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    // AutoComplete,
    // ApiMergeId,
    // SequenceApiCall,
    // MergeMap,
    ExhaustMap,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-22-machine-coding');
}
