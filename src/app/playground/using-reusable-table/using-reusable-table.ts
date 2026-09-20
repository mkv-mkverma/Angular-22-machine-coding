import { Component } from '@angular/core';
import { ReusableComponent } from '../../shared/components/reusable-component/reusable-component';

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
  selector: 'app-using-reusable-table',
  imports: [ReusableComponent],
  templateUrl: './using-reusable-table.html',
  styleUrl: './using-reusable-table.scss',
})
export class UsingReusableTable {
  res: User[] = [
    {
      id: 1,
      name: 'Manish',
      role: 'Admin',
    },
    {
      id: 2,
      name: 'Ram',
      role: 'User',
    },
    {
      id: 2,
      name: 'Hanuman',
      role: 'User',
    },
  ];
  col: Col[] = [
    {
      field: 'name',
      header: 'Name',
    },
    {
      field: 'role',
      header: 'Role',
    },
  ];

  onSave($event: unknown) {
    console.log($event);
  }
}
