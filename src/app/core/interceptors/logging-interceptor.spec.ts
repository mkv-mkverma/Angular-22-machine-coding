import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { loggingInterceptor } from './logging-interceptor';

describe('loggingInterceptor', () => {
  const run = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    TestBed.runInInjectionContext(() => loggingInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs method, url, status and elapsed time on a successful response', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const req = new HttpRequest('GET', '/api/things');
    const next: HttpHandlerFn = () => of(new HttpResponse({ status: 200 }));

    run(req, next).subscribe();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [message] = logSpy.mock.calls[0];
    expect(message).toContain('GET');
    expect(message).toContain('/api/things');
    expect(message).toContain('-> 200');
    expect(message).toMatch(/\(\d+ms\)/);
  });

  it('does not log for intermediate (non-HttpResponse) events', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const req = new HttpRequest('GET', '/api/things');
    // A plain progress-like event object is not an HttpResponse instance.
    const next: HttpHandlerFn = () => of({ type: 0 } as unknown as HttpEvent<unknown>);

    run(req, next).subscribe();

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs method, url and elapsed time on error', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const req = new HttpRequest('POST', '/api/things', null);
    const error = new HttpErrorResponse({ status: 500 });
    const next: HttpHandlerFn = () => throwError(() => error);

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [message, loggedError] = logSpy.mock.calls[0];
    expect(message).toContain('POST');
    expect(message).toContain('/api/things');
    expect(message).toContain('-> ERROR');
    expect(loggedError).toBe(error);
    expect(caught).toBe(error);
  });
});
