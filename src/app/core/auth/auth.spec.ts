import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() posts credentials and stores the returned tokens', () => {
    let result: { accessToken: string; refreshToken: string } | undefined;
    service.login('emilys', 'emilyspass').subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'emilys', password: 'emilyspass' });

    req.flush({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    expect(result).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(service.getAccessToken()).toBe('access-1');
    expect(service.getRefreshToken()).toBe('refresh-1');
  });

  it('refresh() posts the current refresh token and stores the new tokens on success', () => {
    service.setRefreshToken('old-refresh');

    let result: { accessToken: string; refreshToken: string } | undefined;
    service.refresh().subscribe((r) => (result = r));

    const req = httpMock.expectOne('https://dummyjson.com/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });

    req.flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });

    expect(result).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    expect(service.getAccessToken()).toBe('access-2');
    expect(service.getRefreshToken()).toBe('refresh-2');
  });

  it('refresh() dedupes concurrent calls into a single HTTP request', () => {
    const results: { accessToken: string; refreshToken: string }[] = [];
    service.refresh().subscribe((r) => results.push(r));
    service.refresh().subscribe((r) => results.push(r));

    // Only one request should have gone out even though refresh() was called twice.
    const req = httpMock.expectOne('https://dummyjson.com/auth/refresh');
    req.flush({ accessToken: 'access-3', refreshToken: 'refresh-3' });

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ accessToken: 'access-3', refreshToken: 'refresh-3' });
    expect(results[1]).toEqual(results[0]);
  });

  it('refresh() issues a new HTTP request once the previous one has finalized', () => {
    service.refresh().subscribe();
    httpMock
      .expectOne('https://dummyjson.com/auth/refresh')
      .flush({ accessToken: 'a', refreshToken: 'b' });

    service.refresh().subscribe();
    httpMock
      .expectOne('https://dummyjson.com/auth/refresh')
      .flush({ accessToken: 'c', refreshToken: 'd' });

    expect(service.getAccessToken()).toBe('c');
    expect(service.getRefreshToken()).toBe('d');
  });

  it('logout() clears both the access and refresh tokens', () => {
    service.setAccessToken('access');
    service.setRefreshToken('refresh');

    service.logout();

    expect(service.getAccessToken()).toBe('');
    expect(service.getRefreshToken()).toBe('');
  });

  it('isLoggedIn() reflects whether an access token is currently set', () => {
    expect(service.isLoggedIn()).toBe(false);

    service.setAccessToken('token');
    expect(service.isLoggedIn()).toBe(true);

    service.setAccessToken('');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('getAccessToken()/getRefreshToken() return the current signal values', () => {
    service.setAccessToken('acc');
    service.setRefreshToken('ref');

    expect(service.getAccessToken()).toBe('acc');
    expect(service.getRefreshToken()).toBe('ref');
  });
});
