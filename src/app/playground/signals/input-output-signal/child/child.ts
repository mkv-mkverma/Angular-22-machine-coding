import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-child',
  imports: [],
  templateUrl: './child.html',
  styleUrl: './child.scss',
})
export class Child {
  count = input.required<number>();
  handleChildCount = output<number>();

  handleAdd() {
    this.handleChildCount.emit(this.count() + 1);
  }
}
