import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '../auth/auth';
import { inject } from '@angular/core';
import { SKIP_AUTH } from './tokens/skip-interceptor-interceptor';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TelemetryService } from '../analytics/trelemetry.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const telemetryService = inject(TelemetryService);

  if (req.context.get(SKIP_AUTH) || !authService.getAccessToken()) {
    return next(req);
  }

  const clone = req.clone({
    setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
  });

  return next(clone).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const failedToken = clone.headers.get('Authorization');
        const currentToken = `Bearer ${authService.getAccessToken()}`;

        // Another request already refreshed the token
        if (failedToken !== currentToken) {
          // token was already refreshed by another request while this one was in flight —
          // just retry with the current token instead of triggering another refresh() call
          const retried = req.clone({ setHeaders: { Authorization: currentToken } });
          return next(retried);
        }

        // Refresh token
        return authService.refresh().pipe(
          switchMap(() => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
            });
            return next(retried);
          }),
          catchError((refreshError) => {
            // 🔴 Refresh itself failed
            telemetryService.trackException(refreshError, {
              type: 'token_refresh_failure',
              originalUrl: req.url,
              originalMethod: req.method,
            });

            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
