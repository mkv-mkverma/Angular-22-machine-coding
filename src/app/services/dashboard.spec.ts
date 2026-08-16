import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let service: Dashboard;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Dashboard);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets dashboard users, permissions, and features', () => {
    service.getUsers(5).subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users/5').flush([]);
    service.getPermissions().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=3').flush([]);
    service.getFeatures().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_limit=3').flush([]);
  });
});
