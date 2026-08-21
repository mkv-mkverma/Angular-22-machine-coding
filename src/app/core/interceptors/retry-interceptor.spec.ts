import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';

import { retryInterceptor } from './retry-interceptor';

describe('retryInterceptor', () => {
  const run = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    TestBed.runInInjectionContext(() => retryInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not retry non-GET requests, even on a retryable status', () => {
    const req = new HttpRequest('POST', '/x', null);
    const error = new HttpErrorResponse({ status: 503 });
    const next = vi.fn(() => throwError(() => error));

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    expect(next).toHaveBeenCalledTimes(1);
    expect(caught).toBe(error);
  });

  it('rethrows immediately on a non-retryable status without retrying', () => {
    const req = new HttpRequest('GET', '/x');
    const error = new HttpErrorResponse({ status: 404 });
    const next = vi.fn(() => throwError(() => error));

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    expect(next).toHaveBeenCalledTimes(1);
    expect(caught).toBe(error);
  });

  it('retries a GET request on a retryable status with linear backoff, then succeeds', async () => {
    vi.useFakeTimers();
    const req = new HttpRequest('GET', '/x');
    const error = new HttpErrorResponse({ status: 503 });
    // The interceptor calls next(req) exactly once and `retry` resubscribes to that
    // *same* Observable — so a fresh per-attempt outcome needs a cold, re-executing
    // source (defer), not a plain throwError()/of() that's fixed at call time.
    let attempt = 0;
    const next = vi.fn(() =>
      defer(() => {
        attempt++;
        return attempt < 3 ? throwError(() => error) : of(new HttpResponse({ status: 200 }));
      }),
    );

    let result: unknown;
    let completed = false;
    run(req, next).subscribe({
      next: (e) => (result = e),
      complete: () => (completed = true),
    });

    // retryCount 1 -> 1s backoff, retryCount 2 -> 2s backoff
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    expect(next).toHaveBeenCalledTimes(1);
    expect(attempt).toBe(3);
    expect(result).toBeInstanceOf(HttpResponse);
    expect(completed).toBe(true);
  });

  it('gives up and rethrows the last error after exhausting the retry count', async () => {
    vi.useFakeTimers();
    const req = new HttpRequest('GET', '/x');
    const error = new HttpErrorResponse({ status: 502 });
    let attempt = 0;
    const next = vi.fn(() =>
      defer(() => {
        attempt++;
        return throwError(() => error);
      }),
    );

    let caught: unknown;
    run(req, next).subscribe({ error: (e) => (caught = e) });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(3000);

    // initial attempt + 3 retries
    expect(attempt).toBe(4);
    expect(caught).toBe(error);
  });
});
