import {
  HttpContext,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Auth } from '../auth/auth';
import { authInterceptor } from './auth-interceptor';
import { SKIP_AUTH } from './tokens/skip-interceptor-interceptor';

describe('authInterceptor', () => {
  let mockAuth: {
    getAccessToken: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const run = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    mockAuth = {
      getAccessToken: vi.fn(() => ''),
      refresh: vi.fn(),
      logout: vi.fn(),
    };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('bypasses auth entirely when SKIP_AUTH context is set', () => {
    const req = new HttpRequest('GET', '/x', {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));

    run(req, next).subscribe();

    expect(next).toHaveBeenCalledWith(req);
    expect(mockAuth.getAccessToken).not.toHaveBeenCalled();
  });

  it('bypasses auth when there is no access token', () => {
    mockAuth.getAccessToken.mockReturnValue('');
    const req = new HttpRequest('GET', '/x');
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));

    run(req, next).subscribe();

    expect(next).toHaveBeenCalledWith(req);
  });

  it('attaches an Authorization header when an access token exists', () => {
    mockAuth.getAccessToken.mockReturnValue('token-1');
    const req = new HttpRequest('GET', '/x');
    const next = vi.fn((_r: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));

    run(req, next).subscribe();

    expect(next).toHaveBeenCalledTimes(1);
    const calledReq = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(calledReq.headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('on 401, refreshes the token and retries once when the failed token still matches the current one', () => {
    let currentToken = 'token-1';
    mockAuth.getAccessToken.mockImplementation(() => currentToken);
    mockAuth.refresh.mockImplementation(() => {
      currentToken = 'token-2';
      return of({ accessToken: 'token-2', refreshToken: 'r2' });
    });

    const req = new HttpRequest('GET', '/x');
    const next = vi.fn((_r: HttpRequest<unknown>) => {
      if (next.mock.calls.length === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      return of(new HttpResponse({ status: 200 }));
    });

    let result: unknown;
    run(req, next).subscribe((e) => (result = e));

    expect(mockAuth.refresh).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    const retriedReq = next.mock.calls[1][0] as HttpRequest<unknown>;
    expect(retriedReq.headers.get('Authorization')).toBe('Bearer token-2');
    expect(result).toBeInstanceOf(HttpResponse);
  });

  it('on 401, retries with the current token without calling refresh() again if the token already changed', () => {
    let currentToken = 'token-1';
    mockAuth.getAccessToken.mockImplementation(() => currentToken);

    const req = new HttpRequest('GET', '/x');
    const next = vi.fn((_r: HttpRequest<unknown>) => {
      if (next.mock.calls.length === 1) {
        // Simulate another in-flight request already having refreshed the token
        // by the time this one's 401 is handled.
        currentToken = 'token-2';
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      return of(new HttpResponse({ status: 200 }));
    });

    run(req, next).subscribe();

    expect(mockAuth.refresh).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
    const retriedReq = next.mock.calls[1][0] as HttpRequest<unknown>;
    expect(retriedReq.headers.get('Authorization')).toBe('Bearer token-2');
  });

  it('on 401, logs out and navigates to /login when refresh() itself fails, then rethrows', () => {
    mockAuth.getAccessToken.mockReturnValue('token-1');
    const refreshError = new Error('refresh failed');
    mockAuth.refresh.mockReturnValue(throwError(() => refreshError));

    const req = new HttpRequest('GET', '/x');
    const next = vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    expect(mockAuth.refresh).toHaveBeenCalledTimes(1);
    expect(mockAuth.logout).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(caught).toBe(refreshError);
  });

  it('rethrows non-401 errors without touching auth state', () => {
    mockAuth.getAccessToken.mockReturnValue('token-1');
    const serverError = new HttpErrorResponse({ status: 500 });
    const next = vi.fn(() => throwError(() => serverError));
    const req = new HttpRequest('GET', '/x');

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    expect(caught).toBe(serverError);
    expect(mockAuth.refresh).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
