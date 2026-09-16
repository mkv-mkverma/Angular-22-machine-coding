import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { TelemetryService } from '../analytics/trelemetry.service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const telemetryService = inject(TelemetryService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 400:
          console.error('Invalid request, Bad request', error);
          break;

        case 401:
          console.error('Authentication required', error);
          break;

        case 403:
          console.error('Access denied', error);
          break;

        case 404:
          console.error('API Not Found', error);
          break;

        case 409:
          console.error('Conflict', error);
          break;

        case 429:
          console.error('Too many requests - slow down', error);
          break;

        default:
          if (error.status >= 500) {
            console.error('Server error, try again later', error);
          }
      }

      // Send API error to Sentry
      telemetryService.trackException(new Error(`HTTP ${error.status}: ${error.message}`), {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
      });

      return throwError(() => error);
    }),
  );
};
