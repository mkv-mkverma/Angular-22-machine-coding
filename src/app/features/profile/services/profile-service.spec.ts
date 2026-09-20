import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProfileService } from './profile-service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets a user and reuses a cached response', () => {
    const user = { id: 7, firstName: 'Manish' };
    const firstValues: unknown[] = [];
    const secondValues: unknown[] = [];

    service.getCachedUser(7).subscribe((value) => firstValues.push(value));
    service.getCachedUser(7).subscribe((value) => secondValues.push(value));

    const request = httpMock.expectOne('https://dummyjson.com/users/7');
    request.flush(user);

    expect(firstValues).toEqual([user]);
    expect(secondValues).toEqual([user]);
  });

  it('removes a failed request from the cache so it can be retried', () => {
    service.getCachedUser(3).subscribe({ error: () => undefined });
    httpMock.expectOne('https://dummyjson.com/users/3').flush('Not found', { status: 404, statusText: 'Not Found' });

    service.getCachedUser(3).subscribe();
    httpMock.expectOne('https://dummyjson.com/users/3').flush({ id: 3, firstName: 'Rahul' });
  });

  it('updates a user and refreshes its cached value', () => {
    const user = { id: 2, firstName: 'Updated' };

    service.updateUser(user).subscribe((response) => expect(response).toEqual(user));
    const request = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/2');
    expect(request.request.method).toBe('PUT');
    request.flush(user);

    service.getCachedUser(2).subscribe((response) => expect(response).toEqual(user));
  });
});
