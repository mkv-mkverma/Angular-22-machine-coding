import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private route = inject(ActivatedRoute);

  dashboardData = this.route.snapshot.data['dashboardResolver'];

  readonly cards: DashboardCard[] = [
    {
      title: 'Exhaust Map',
      description: 'Ignores new clicks while the current request is in progress.',
      icon: '⇢',
      route: '/exhaust-map',
    },
    {
      title: 'Short Polling',
      description: 'Refreshes data automatically at a fixed interval.',
      icon: '↻',
      route: '/short-polling',
    },
  ];
}
