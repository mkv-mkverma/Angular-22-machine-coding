import { Component, inject } from '@angular/core';

import * as Sentry from '@sentry/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sentry-test',
  imports: [],
  templateUrl: './sentry-test.html',
  styleUrl: './sentry-test.scss',
})
export class SentryTest {
  private http = inject(HttpClient);

  testException(): void {
    throw new Error('Sentry test exception');
  }

  testApiError(): void {
    this.http.get('https://jsonplaceholder.typicode.com/invalid-url').subscribe();
  }

  testSentry(): void {
    Sentry.captureException(new Error('My Angular Sentry test error'));
  }

  public throwTestError(): void {
    // Send a log before throwing the error
    Sentry.logger.info(Sentry.logger.fmt`User ${'sentry-test'} triggered test error button`, {
      action: 'test_error_button_click',
    });
    // Send a test metric before throwing the error
    Sentry.metrics.count('test_counter', 1);
    throw new Error('Sentry Test Error');
  }

  testLogger(): void {
    Sentry.logger.info(Sentry.logger.fmt`Sentry test logger`, {
      action: 'test_logger',
    });
  }

  testMetric(): void {
    Sentry.metrics.count('sentry_test_counter', 1);
  }
}
