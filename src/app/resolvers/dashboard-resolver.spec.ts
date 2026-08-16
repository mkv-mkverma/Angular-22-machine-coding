import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

import { dashboardResolver, type DashboardResolverData } from './dashboard-resolver';
import { Dashboard } from '../services/dashboard';

describe('dashboardResolver', () => {
  const executeResolver: ResolveFn<DashboardResolverData> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => dashboardResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Dashboard,
          useValue: {
            getUsers: () => of(['user']),
            getPermissions: () => of(['permission']),
            getFeatures: () => of(['feature']),
          },
        },
      ],
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });

  it('resolves the dashboard data from all three API calls', () => {
    const result = executeResolver(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ) as Observable<DashboardResolverData>;

    result.subscribe((data) => {
      expect(data).toEqual({
        users: ['user'],
        permissions: ['permission'],
        features: ['feature'],
      });
    });
  });
});
