import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  const run = (next: HttpHandlerFn) => {
    const req = new HttpRequest('GET', '/x');
    return TestBed.runInInjectionContext(() => errorInterceptor(req, next));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [400, 'Invalid request, Bad request'],
    [401, 'Authentication required'],
    [403, 'Access denied'],
    [404, 'API Not Found'],
    [409, 'Conflict'],
    [429, 'Too many requests - slow down'],
    [500, 'Server error, try again later'],
    [503, 'Server error, try again later'],
  ])('logs the right message for status %d and rethrows', (status, message) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new HttpErrorResponse({ status: status as number });
    const next: HttpHandlerFn = () => throwError(() => error);

    let caught: unknown;
    run(next).subscribe({ error: (e) => (caught = e) });

    expect(errorSpy).toHaveBeenCalledWith(message, error);
    expect(caught).toBe(error);
  });

  it('does not log for an unmatched status below 500 (default branch, no >=500 log)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new HttpErrorResponse({ status: 418 });
    const next: HttpHandlerFn = () => throwError(() => error);

    let caught: unknown;
    run(next).subscribe({ error: (e) => (caught = e) });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(caught).toBe(error);
  });
});
