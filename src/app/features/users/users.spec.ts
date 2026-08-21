import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Auth } from '../../core/auth/auth';
import { Users } from './users';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('https://dummyjson.com/auth/me').flush({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      age: 30,
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logout() calls Auth.logout() and navigates to /login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const logoutSpy = vi.spyOn(TestBed.inject(Auth), 'logout');

    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('callMe() subscribes to getMe() and logs the response', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    component.callMe();
    httpMock.expectOne('https://dummyjson.com/auth/me').flush({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      age: 30,
    });

    expect(logSpy).toHaveBeenCalled();
  });

  it('fireFive() fires getMe() five separate times', () => {
    component.fireFive();

    const requests = httpMock.match('https://dummyjson.com/auth/me');
    expect(requests).toHaveLength(5);
    requests.forEach((req) =>
      req.flush({ firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', age: 30 }),
    );
  });
});
