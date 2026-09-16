import { ErrorHandler, Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TelemetryService } from '../analytics/trelemetry.service';

@Service({ autoProvided: false })
export class GlobalErrorHandler implements ErrorHandler {
  private readonly telemetryService = inject(TelemetryService);
  private readonly router = inject(Router);

  handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Send exception to Sentry
    this.telemetryService.trackException(error, {
      url: this.router.url,
      timestamp: new Date().toISOString(),
      stack: errorStack,
    });

    // Application analytics / telemetry event
    this.telemetryService.trackEvent({
      eventName: 'exception',
      description: errorMessage,
      properties: {
        url: this.router.url,
      },
    });

    // Important:
    // Don't expose sensitive information.
    // Don't send the entire error object blindly.

    // Optional local logging
    console.error(error);
  }
}
