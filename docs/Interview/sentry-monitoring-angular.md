# Sentry Monitoring — Angular

## Architecture

```text
                         Angular App
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       Runtime Error      HTTP/API Error    User / App Events
             │                │                │
             ▼                ▼                ▼
    GlobalErrorHandler   errorInterceptor   TelemetryService
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                     TelemetryService
                              │
                              ▼
                    Sentry.captureException()
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
             Errors        Tracing        Replay
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                           Sentry
```

## Folder Structure

```text
src/app/
│
├── core/
│   │
│   ├── error/
│   │   └── global-error-handler.ts
│   │
│   ├── interceptors/
│   │   ├── error-interceptor.ts
│   │   ├── auth-interceptor.ts
│   │   ├── retry-interceptor.ts
│   │   └── logging-interceptor.ts
│   │
│   └── analytics/
│       └── telemetry.service.ts
│
├── features/
│   │
│   └── monitoring/
│       └── sentry-test/
│           ├── sentry-test.ts
│           ├── sentry-test.html
│           └── sentry-test.scss
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## Responsibilities

```text
global-error-handler.ts
        ↓
Angular/runtime errors


error-interceptor.ts
        ↓
API/HTTP errors


auth-interceptor.ts
        ↓
401 → refresh → logout


telemetry.service.ts
        ↓
Central Sentry abstraction


sentry-test/
        ↓
Development testing
        ├── Test application error
        ├── Test API error
        ├── Test logger
        └── Test metric


environment.ts
        ↓
Sentry DSN + API configuration
```

## Interview Explanation

> "I integrated Sentry as the observability layer. Runtime errors are captured through Angular's GlobalErrorHandler, HTTP failures through an HTTP interceptor, and both go through a TelemetryService before being sent to Sentry. I also enabled tracing and session replay and created a development-only monitoring test page to validate the integration."
