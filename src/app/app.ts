import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoComplete } from "./components/auto-complete/auto-complete";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AutoComplete],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-22-machine-coding');
}
