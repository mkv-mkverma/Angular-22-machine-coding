import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Dashboard } from '../services/dashboard';

export interface DashboardResolverData {
  users: unknown[];
  permissions: unknown[];
  features: unknown[];
}

export const dashboardResolver: ResolveFn<DashboardResolverData> = () => {
  const api = inject(Dashboard);

  return forkJoin({
    users: api.getUsers(),
    permissions: api.getPermissions(),
    features: api.getFeatures(),
  });
};
