import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DASHBOARD_CARDS } from './dashboard.constant';
import { PipeExample } from '../pipe-example/pipe-example';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, PipeExample],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnDestroy {
  private readonly route = inject(ActivatedRoute);

  dashboardData = this.route.snapshot.data['dashboardResolver'];
  message = this.route.snapshot.data['message'];
  readonly cards = DASHBOARD_CARDS;

  ngOnDestroy(): void {
    this.message = null;
  }
}
