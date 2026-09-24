# Performance

---

## 1. How do you reduce initial bundle size?

- Lazy load routes/features using `loadComponent` or `loadChildren`
- Use standalone components and avoid importing large modules globally
- Optimize third-party dependencies
- Defer non-critical code using `@defer`
- Optimize assets
- `source-map-explorer` - Analyze the bundle
- Avoid eagerly importing large feature libraries from `app.config.ts`
- `ng build --configuration production`

---

## 2. What is lazy loading?

Lazy loading is a technique where we split application code into separate chunks and load those chunks only when the corresponding feature is needed. In Angular, we commonly achieve this with `loadChildren` or `loadComponent`. It reduces the initial JavaScript bundle and improves startup performance.

```ts
const routes: Routes = [
  {
    path: 'name',
    loadComponent: () =>
      import('url')
        .then(m => m.component)
  }
];
```

> Smaller initial bundle → less JavaScript to download → faster initial application load.

---

## 3. What is code splitting?

Code splitting is the technique of breaking an application into smaller JavaScript chunks so that the browser doesn't have to download the entire application upfront. Lazy loading is one mechanism that determines when those chunks are downloaded.

---

## 4. How do you analyze bundle size?

```bash
npm install --save-dev source-map-explorer
ng build --configuration production --source-map
npx source-map-explorer "dist/<project-name>/browser/*.js"
```

I analyze bundle size by first doing a production build, checking Angular's initial and lazy chunk sizes, and then using tools like source-map-explorer to inspect the contents of those chunks. I identify large dependencies, determine whether they're eagerly loaded unnecessarily, and then optimize through lazy loading, code splitting, tree-shaking, dependency replacement or removal. Finally, I rebuild and compare the bundle size to verify the improvement.

---

## 5. What are Core Web Vitals?

Core Web Vitals are Google's key user-experience metrics. The three current metrics are LCP for loading performance, INP for interaction responsiveness, and CLS for visual stability. In Angular, I would improve them through techniques like reducing the initial bundle, lazy loading and deferring non-critical code, optimizing images and fonts, minimizing expensive JavaScript and rendering work, and reserving space for dynamic content.

| Metric | Measures                                           | Target   |
| ------ | -------------------------------------------------- | -------- |
| LCP    | How quickly the main content appears               | ≤ 2.5s   |
| INP    | How quickly the page responds to user interactions | ≤ 200ms  |
| CLS    | How much the layout unexpectedly moves             | ≤ 0.1    |

**Common causes:**

- **LCP** — larger images, js bundle, API/server response
- **INP** — expensive CD, rendering, task, heavy js
- **CLS** — images without dimentions, fonts causing layout shift, Dynamic insertion content

---

## 6. How would you improve LCP?

Measures how quickly the main/primary content becomes visible — hero image, heading, or large content block.

- Reduce initial JavaScript - lazyloading, `@defer`, remove unnecessary dependencies
- `NgOptimizedImage` - `priority`, use WebP, AVIF images

---

## 7. How would you improve INP?

- Reduce Angular change detection - OnPush, Signals, trackBy
- Code splitting, lazyloading, `@defer`
- Use pagination or virtual scrolling for large lists.

> Reduce JS → reduce long tasks → optimize event handlers → reduce Angular rendering/change detection → avoid unnecessary DOM work → defer non-critical work.

---

## 8. How would you reduce CLS?

> Reserve space → set image dimensions → handle fonts → don't inject content above existing content → use transform/opacity for animations.

---

## 9. How would you improve a slow Angular application?

**Tools:** Chrome DevTools, Lighthouse and Angular DevTools. Network Tab, Memory Tab

Then I optimize the application based on whether the problem is bundle size, rendering, change detection, API calls, or DOM size.

### Reduce initial bundle size

- Lazy-load routes/features, `loadComponent`, `loadChildren`, use of `@defer`
- Use code splitting, Split large features/components
- Use production builds rather then development
- Remove unused dependencies/ package/ imported
- Analyze bundles with source-map-explorer

### Optimize change detection

- `changeDetection: ChangeDetectionStrategy.OnPush`
- Avoid functions in templates
- Use `track`
- Use signals where appropriate
- Avoid unnecessary state updates

### Optimize large lists (10,000 records)

- Pagination, Virtual scrolling, `track`, Server-side filtering/sorting

### Optimize API calls

- Avoid duplicate API requests
- Use caching where appropriate
- Debounce search inputs
- Parallelize independent requests

### Lazy-load non-critical resources

- routes/components/features/images (not LCP image)/ `@defer`

### Optimize images

- Set width and height: prevent layout shifts (CLS)
- Use modern formats: WebP / AVIF
- Comprased Images
- Use SVG for icons/logos: when the asset is vector-based

**How do I generate WebP / AVIF?** `npm install sharp`

```js
await sharp('image.jpg')
  .webp({ quality: 80 })
  .toFile('image.webp');

await sharp('image.jpg')
  .avif({ quality: 60 })
  .toFile('image.avif');
```

```text
                 IMAGE OPTIMIZATION
                        │
         ┌──────────────┼──────────────┐
         ↓              ↓              ↓
      Format        Dimensions      Delivery
         │              │              │
     WebP/AVIF      Responsive        CDN
         │            srcset           │
         ↓              ↓              ↓
     Compress     400/800/1200    Edge server
```

### Reduce DOM complexity

- Use virtual scrolling, unnecessary nested elements, Avoid rendering hidden components

> I wouldn't blindly optimize Angular code. I'd first measure the bottleneck. I'd check bundle size and network performance, then rendering and change detection, API calls, DOM size, and long-running JavaScript. Depending on the bottleneck, I'd use lazy loading and code splitting, OnPush or signals, efficient list rendering and virtual scrolling, API caching/debouncing, and image optimization. Finally, I'd measure the improvement using Lighthouse, Core Web Vitals and Angular DevTools.

---

## 10. How does Angular change detection work?

**Traditional Angular**

```text
User event / async task
        ↓
Zone.js notified
        ↓
Angular
        ↓
Change Detection (check binding)
        ↓
Update DOM
```

**Zoneless Angular**

```text
Signal / input / event / notification
        ↓
Angular notified
        ↓
Change Detection scheduled (check binding)
        ↓
Update affected views
```

---

## 11. Default vs OnPush?

**Default** — async activity (HTTP/API calls with sub or async pipe, timer, Promises, Observable with async pipe), Event (click, input)

```text
Angular starts change detection
        ↓
Checks component tree
        ↓
Checks bindings
        ↓
Compare/reconcile values
        ↓
DOM update only where necessary
```

**OnPush**

- `@Input()` reference changes
- An event handled in the component/subtree
- async pipe receives a new value
- `markForCheck()`, `detectChanges()`, Signal

**Default:** timer, `@Input` with same object

If you're manually subscribing and changing component state, you may need to explicitly notify an OnPush component depending on how that state is being updated.

> **Default:** when CD runs, Angular checks broadly (component and its children).
> **OnPush:** Angular can skip the subtree unless there is a reason to check it, such as an input reference change, event, async-pipe emission, signal change, or explicit notification.

---

## 12. How do Signals improve Angular performance?

Angular tracks which components or templates depend on a signal, so when the signal changes, Angular knows what is affected and can update only the necessary parts instead of doing unnecessary change-detection work across unrelated parts of the application. This becomes especially beneficial with zoneless Angular.

---

## 13. How do you optimize a large Angular table?

For a large Angular table, I would first use server-side pagination, filtering and sorting so I don't load unnecessary data. If a large dataset must be available on the client, I would use CDK virtual scrolling to reduce the number of DOM rows. I would use Signals for reactive state, track to efficiently reuse DOM elements, and consider zoneless change detection to reduce unnecessary change-detection work. I would also avoid expensive functions in templates and render only the columns and data that are actually needed.

---

## 14. How do you optimize AG Grid?

---

## 15. How would you optimize 10,000 records?

First, if possible, I'd use server-side pagination so I don't download all 10,000 records. If the requirement is to have all records available on the client, I'd use virtual scrolling so only visible rows are rendered. I'd also use OnPush, trackBy, avoid expensive template expressions, and optimize filtering and sorting. Signals can help with reactive state management, but they don't replace virtualization.

```ts
imports: [CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll, CommonModule],
```

```html
<cdk-virtual-scroll-viewport [itemSize]="50" style="height: 400px">
  <div *cdkVirtualFor="let item of items; trackBy: trackById">
    {{ item.name }}
  </div>
</cdk-virtual-scroll-viewport>
```

```ts
trackById(index: number, item: Item) {
  return item.id;
}
```

---

## 16. How would you optimize API-heavy pages?

- Run independent APIs in parallel - `forkJoin`
- Cache APIs - rxjs level and app-level (Use caching for stable data, config, dropdown data, country, state, permission, etc)
- Debounce search
- Cancel stale requests

```ts
search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.http.get(`/api/search?q=${term}`))
);
```

- Reduce payload, server-side pagination, filter, sort or use cdk virtual scroll
- Lazy-load API data

---

## 17. How would you diagnose a production performance issue?

I look at performance at multiple layers: DOM rendering, change detection, JavaScript/bundle size, API/data handling, images, and memory.

```text
ANGULAR PERFORMANCE
│
├── 1. DOM rendering
│   ├── Virtual scroll
│   ├── Pagination
│   └── track
│
├── 2. Change Detection
│   ├── Signals
│   ├── Zoneless
│   └── OnPush
│
├── 3. JavaScript/bundle size
│   ├── Lazy loading
│   ├── Code splitting
│   ├── @defer
│   ├── Tree shaking
│   └── Remove unused dependencies
│
├── 4. API/Data handling
│   ├── Cache
│   ├── Pagination
│   ├── Debounce
│   ├── switchMap
│   └── Parallel requests
│
├── 5. Images
│   ├── WebP/AVIF
│   ├── SVG
│   ├── Responsive images
│   ├── CDN
│   └── Lazy loading
│
└── 6. Memory
    ├── Cleanup subscriptions
    ├── takeUntilDestroyed
    ├── Cleanup timers/listeners
    └── Avoid unbounded caches
```

---

## 18. How would you diagnose a memory leackage?

The application keeps holding memory that it no longer needs.

**Point to prod env:**

```bash
ng build --source-map
npx http-server dist/Angular-22-machine-coding/browser
```

**Steps:**

1. Incognito browser (chrome dev tool memory tab)
2. Memory tab — take heapshot, then perform action, then again heapshot, and again perform action and above compare is there
3. Lighthouse, performance, memory — take heapshot and search for component, expand and click and you can see exact method, understand analysis and fix the issue

> I wouldn't manually inspect all components. First I would reproduce the user flow and take multiple heap snapshots before and after navigating away from the page, forcing GC between snapshots. If memory keeps growing, I compare the snapshots and look for objects whose count or retained size keeps increasing. Then I use the Retainers/Retaining Path view to determine what is keeping those objects alive. That points me back to the Angular component, service, subscription, event listener, timer, or DOM reference responsible. For a large application, I can automate the navigation/repetition using Playwright or Cypress rather than manually testing every component.

**Lighthouse check** (core web vitals, SEO, A11y)

**References:**

- https://www.youtube.com/watch?v=6IlTjqU_Tc0&t=132s
- https://www.youtube.com/watch?v=BwThIqKD_lg

---

## 19. What causes unnecessary React renders?

## 20. When would you use useMemo?

## 21. When would you use useCallback?

## 22. How do you fix production bug?

---

## 23. Global Error Handle? (`ErrorHandler`)

```text
HTTP error
    ↓
HTTP Interceptor / catchError

Expected business error
    ↓
Service / Component

Unexpected runtime error
    ↓
GlobalErrorHandler
```

**Production flow:**

```text
                    PRODUCTION
                        │
                        ▼
              API returns unexpected
                 response structure
                        │
                        ▼
              Angular code expects
                  response.data
                        │
                        ▼
              Runtime TypeError
                        │
                        ▼
              GlobalErrorHandler
                        │
                        ▼
             Normalize + add context
                        │
                        ▼
              Analytics / Monitoring
                        │
                        ▼
          Developer sees production error
                        │
                        ▼
               Reproduce locally
                        │
                        ▼
                 Find root cause
                        │
                        ▼
              Fix + regression test
                        │
                        ▼
                  STG → QA
                        │
                        ▼
                  Production
```

**Reporting pipeline:**

```text
GlobalErrorHandler
        ↓
AnalyticsService
        ↓
Monitoring platform
        ↓
Dashboard / alert
```

**What we send for a runtime error:** errorMessage, url, timestamp, browser, unsensitive user info

> I use Angular's ErrorHandler as a centralized safety net for unexpected runtime errors. I implement a custom GlobalErrorHandler and register it as the application's ErrorHandler. When an unexpected runtime error occurs, the handler normalizes the error and sends useful context such as the current route, application version and stack information to our monitoring or analytics service.
>
> I don't use it as the primary mechanism for HTTP or expected business errors. HTTP errors are handled through our HTTP interceptor and service/component-level catchError where UI-specific handling is required. The global handler is mainly for unexpected errors that escape those normal handling paths.

### Real scenario

For example, suppose our frontend expects an API response with a `data` property, but a backend change starts returning `result`. TypeScript doesn't validate the runtime JSON structure, so code accessing `response.data[0]` can throw a runtime TypeError. Our GlobalErrorHandler captures that error along with the route and other context and reports it to our monitoring system. I then reproduce the customer scenario locally, identify the API contract mismatch as the RCA, fix the mapping or contract, add a regression test, validate it in staging with QA, and then deploy the patch.

| Layer              | Responsibility                                              |
| ------------------ | ----------------------------------------------------------- |
| HTTP Interceptor   | common HTTP concerns                                        |
| catchError         | expected RxJS/API failure handling                          |
| Component/service  | UI/business-specific recovery                               |
| GlobalErrorHandler | unexpected/unhandled application errors + centralized reporting |

**"Telemetry"** is the umbrella term: errors + performance (Core Web Vitals, TTFB, etc.) + usage, all correlated by session/build. New Relic, Sentry and Datadog RUM are the two most common dedicated frontend error-monitoring choices outside the Microsoft stack — purpose-built for exactly what GlobalErrorHandler is trying to do: fingerprinting, source-map upload, release tracking, breadcrumbs, alerting.

> GlobalErrorHandler tells Sentry that an error happened. CI/CD source-map upload tells Sentry how to translate that error back to your original TypeScript code.

---

## ng-content vs ng-template

- **`ng-content`** → "Give me content from the parent"
- **`ng-template`** → "Give me a template that I can render later/repeatedly"

```text
PARENT
│
│ gives HTML
↓
CHILD
│
└── <ng-content>
```

```text
TEMPLATE
│
│ blueprint
↓
RENDER WHEN NEEDED
```
