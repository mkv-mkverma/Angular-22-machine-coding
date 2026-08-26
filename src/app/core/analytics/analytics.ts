import { Service } from '@angular/core';

@Service()
export class Analytics {
  trackEvent(event: { eventName: string; description: string }): void {
    // Send to your analytics/monitoring system (telemetry) / Sentry / Datadog RUM
    // Google Analytics (GA4) marketing analytics tool: pageviews, conversion funnels, user behavior
    console.log(event);
  }
}
