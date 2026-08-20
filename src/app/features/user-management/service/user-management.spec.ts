import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserManagementService } from './user-management';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUsers() GETs the users list', () => {
    let result: unknown;
    service.getUsers().subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/users');
    expect(req.request.method).toBe('GET');
    const response = { users: [], total: 0, skip: 0, limit: 30 };
    req.flush(response);

    expect(result).toEqual(response);
  });

  it('getUser(id) GETs a single user by id', () => {
    let result: unknown;
    service.getUser(1).subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/users/1');
    expect(req.request.method).toBe('GET');
    const user = { id: 1, firstName: 'Jane', lastName: 'Doe', age: 30, image: 'x' };
    req.flush(user);

    expect(result).toEqual(user);
  });

  it('createUser() POSTs the new user payload', () => {
    let result: unknown;
    service.createUser({ firstName: 'Jane', lastName: 'Doe', age: 30 }).subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/users/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ firstName: 'Jane', lastName: 'Doe', age: 30 });
    req.flush({ id: 1, firstName: 'Jane', lastName: 'Doe', age: 30 });

    expect(result).toEqual({ id: 1, firstName: 'Jane', lastName: 'Doe', age: 30 });
  });

  it('deleteUser(id) DELETEs the user by id', () => {
    let result: unknown;
    service.deleteUser(1).subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1, isDeleted: true });

    expect(result).toEqual({ id: 1, isDeleted: true });
  });

  // NOTE: updateUser(id) builds an HttpClient.put(...) observable but never subscribes to it
  // (and never returns it). Angular's HttpClient never fires the actual HTTP request for an
  // observable that has no subscriber, so calling updateUser() in production sends no request
  // at all — it is currently a no-op. This is flagged in the test-coverage report rather than
  // fixed here (production code is out of scope for this spec). We only assert the no-op here;
  // we do not pretend it performs an HTTP call.
  it('updateUser(id) does not issue any HTTP request (documents a production no-op)', () => {
    expect(() => service.updateUser(1)).not.toThrow();
    httpMock.expectNone('https://dummyjson.com/users/1');
  });
});
