import { ErrorHandler, Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Analytics } from '../analytics/analytics';

@Service({ autoProvided: false })
export class GlobalErrorHandler implements ErrorHandler {

  private readonly analyticsService = inject(Analytics);
  private readonly router = inject(Router);

  handleError(error: unknown): void {

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.analyticsService.trackEvent({
      eventName: 'exception',
      description: JSON.stringify({
        message: errorMessage,
        stack: errorStack,
        url: this.router.url,
        timestamp: new Date().toISOString()
      })
    });

    // Important:
    // Don't expose sensitive information.
    // Don't send the entire error object blindly.
  }
}