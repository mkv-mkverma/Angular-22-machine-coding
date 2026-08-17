import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Returns a high-resolution timer representing milliseconds since the page/process started measuring.
  // Date.now() → "What time is it?"
  // performance.now() → "How long did this take?"
  const started = performance.now();
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(
            `${req.method} ${req.url} -> ${event.status} (${Math.round(performance.now() - started)}ms)`,
          );
        }
      },
      error: (error) => {
        console.log(
          `${req.method} ${req.url} -> ERROR (${Math.round(performance.now() - started)}ms)`,
          error,
        );
      },
    }),
  );
};
