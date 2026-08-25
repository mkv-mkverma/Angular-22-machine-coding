import { Component, signal } from '@angular/core';
import { MemoryLeakChild } from './memory-leak-child';

@Component({
  selector: 'app-memory-leak',
  imports: [MemoryLeakChild],
  templateUrl: './memory-leak.html',
  styleUrl: './memory-leak.scss',
})
export class MemoryLeak {
  showChild = signal(false);
  mountCount = signal(0);

  toggleChild(): void {
    this.showChild.update((visible) => !visible);
    if (this.showChild()) {
      this.mountCount.update((count) => count + 1);
    }
  }
}
