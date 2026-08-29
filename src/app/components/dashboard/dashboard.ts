import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Profile } from '../../profile/components/profile/profile';
import { DASHBOARD_CARDS } from './dashboard.constant';
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
  selector: 'app-dashboard',
  imports: [RouterLink, Profile, ReusableComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private route = inject(ActivatedRoute);

  dashboardData = this.route.snapshot.data['dashboardResolver'];
  message = this.route.snapshot.data['message'];
  readonly cards = DASHBOARD_CARDS;
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

  onSave($event:unknown){
    console.log($event)
  }
  
}
