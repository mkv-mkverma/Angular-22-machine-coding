import { Component, computed, signal } from '@angular/core';
import { Child } from './child/child';

@Component({
  selector: 'app-parent',
  imports: [Child],
  templateUrl: './parent.html',
  styleUrl: './parent.scss',
})
export class Parent {
  count = signal<number>(1);
  doubleCount = computed(() => this.count() * 2);

  handleClick(event: number) {
    this.count.set(event);
  }
}
