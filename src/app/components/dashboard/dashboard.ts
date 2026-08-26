import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Profile } from '../../profile/components/profile/profile';
import { DASHBOARD_CARDS } from './dashboard.constant';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Profile],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private route = inject(ActivatedRoute);

  dashboardData = this.route.snapshot.data['dashboardResolver'];
  message = this.route.snapshot.data['message'];
  readonly cards = DASHBOARD_CARDS;

}
