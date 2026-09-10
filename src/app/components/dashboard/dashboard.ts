import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DASHBOARD_CARDS } from './dashboard.constant';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);

  dashboardData = this.route.snapshot.data['dashboardResolver'];
  message = this.route.snapshot.data['message'];
  readonly cards = DASHBOARD_CARDS;
}
