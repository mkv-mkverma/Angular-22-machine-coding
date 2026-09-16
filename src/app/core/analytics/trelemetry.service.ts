import { Service } from '@angular/core';
import * as Sentry from '@sentry/angular';

export interface TelemetryEvent {
  eventName: string;
  description?: string;
  properties?: Record<string, unknown>;
}

@Service()
export class TelemetryService {
  trackAnalyticsEvent(event: { eventName: string; description: string }): void {
    // Send to your analytics/monitoring system (telemetry) / Sentry / Datadog RUM
    // Google Analytics (GA4) marketing analytics tool: pageviews, conversion funnels, user behavior
    console.log(event);
  }

  /**
   * Track application/business events.
   */
  trackEvent(event: TelemetryEvent): void {
    console.log('[Telemetry]', event);

    Sentry.addBreadcrumb({
      category: 'application',
      message: event.eventName,
      data: event.properties,
      level: 'info',
    });
  }

  /**
   * Track application exceptions.
   */
  trackException(error: unknown, context?: Record<string, unknown>): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  /**
   * Track informational messages.
   */
  trackMessage(message: string, context?: Record<string, unknown>): void {
    Sentry.captureMessage(message, {
      level: 'info',
      extra: context,
    });
  }

  /**
   * Track a custom metric.
   */
  trackMetric(name: string, value = 1): void {
    Sentry.metrics.count(name, value);
  }
}
