import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from '../../core/auth/auth';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuth: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    mockAuth = {
      login: vi.fn(),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [{ provide: Auth, useValue: mockAuth }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('login() calls Auth.login() with the form values and navigates to /users on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    mockAuth.login.mockReturnValue(of({ accessToken: 'a', refreshToken: 'b' }));

    component.emailControl.setValue('manish@example.com');
    component.passwordControl.setValue('secret');
    component.login();

    expect(mockAuth.login).toHaveBeenCalledWith('manish@example.com', 'secret');
    expect(navigateSpy).toHaveBeenCalledWith(['/users']);
  });

  it('login() logs the error and does not navigate when Auth.login() fails', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const loginError = new Error('invalid credentials');
    mockAuth.login.mockReturnValue(throwError(() => loginError));

    component.emailControl.setValue('bad@example.com');
    component.passwordControl.setValue('wrong');
    component.login();

    expect(errorSpy).toHaveBeenCalledWith('Login failed:', loginError);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('logout() calls Auth.logout() and navigates to /login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.logout();

    expect(mockAuth.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
