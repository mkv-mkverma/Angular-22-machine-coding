import { Service } from '@angular/core';
declare function gtag(...args: (string | Record<string, string | number | boolean>)[]): void;
@Service()
export class GoogleAnalytics {
  pageView(url: string): void {
    gtag('event', 'page_view', {
      page_path: url,
    });
  }

  event(eventName: string, parameters: Record<string, string | number | boolean> = {}): void {
    gtag('event', eventName, parameters);
  }
}
