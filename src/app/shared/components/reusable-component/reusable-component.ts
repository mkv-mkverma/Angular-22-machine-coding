import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
export interface User {
  id: number;
  name: string;
  role: string;
}

export interface Col {
  field: keyof User;
  header: string;
}
@Component({
  selector: 'app-reusable-component',
  imports: [CommonModule],
  templateUrl: './reusable-component.html',
  styleUrl: './reusable-component.scss',
})
export class ReusableComponent {
  @Input() userData: User[] = [];

  @Input() columns: Col[] = [];
  @Output() save = new EventEmitter();
}
