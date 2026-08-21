import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { API_URL } from './components/core/tokens/api-url.token';
import { environment } from '../environments/environment';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { retryInterceptor } from './core/interceptors/retry-interceptor';
import { loggingInterceptor } from './core/interceptors/logging-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // maps route parameters, query parameters, and route data directly to component inputs
    provideRouter(
      routes,
      // input parent route
      withComponentInputBinding(),
      // input child route will work now
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    { provide: API_URL, useValue: environment.apiUrl },
    provideHttpClient(
      withInterceptors([
        ...(environment.production ? [] : [loggingInterceptor]),
        errorInterceptor,
        retryInterceptor,
        authInterceptor,
      ]),
    ),
  ],
};
