import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Users } from './users';

describe('Users', () => {
  let service: Users;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Users);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets users', () => {
    service.getUsers().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);
  });

  it('caches the users request and shares it across subscribers', () => {
    const first: unknown[] = [];
    const second: unknown[] = [];

    service.getuserCashed().subscribe((users) => first.push(users));
    service.getuserCashed().subscribe((users) => second.push(users));

    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([{ id: 1, name: 'Manish' }]);

    expect(first).toEqual(second);
  });

  it('refreshes the cache so the next call issues a new request', () => {
    service.getuserCashed().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);

    service.refreshUsers();

    service.getuserCashed().subscribe();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users').flush([]);
  });

  it('updates a user and refreshes the cache', () => {
    const user = { id: 1, name: 'Updated' };
    service.updateUser(user).subscribe((response) => expect(response).toEqual(user));

    const request = httpMock.expectOne('/api/users/1');
    expect(request.request.method).toBe('PUT');
    request.flush(user);
  });
});
