import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { dashboardResolver, type DashboardResolverData } from './dashboard-resolver';

describe('dashboardResolver', () => {
  const executeResolver: ResolveFn<DashboardResolverData> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => dashboardResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
