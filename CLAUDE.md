# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Angular 22 interview/machine-coding practice repo. Each component under `src/app/components/` is a self-contained demo of an RxJS operator, pattern, or Angular API (e.g. `exhaust-map`, `merge-map`, `combine-latest`, `retry-when`, `short-polling`, `auto-complete`, `sequence-api-call`, `user-filter`, `cached-api`, `api-merge-id`). `docs/DOC.md` is a running set of interview-style notes on RxJS/Signals explanations that pair with the demos — check it when working on a component to see the concept it's meant to illustrate.

## Commands

```bash
npm start                 # ng serve, http://localhost:4200
npm run build              # ng build (production config by default)
npm run watch               # ng build --watch (development config)
npm test                    # ng test --watch=false (single run, used in pre-commit)
npm run test:watch           # ng test (watch mode, use while developing)
npm run test:coverage        # ng test --watch=false --coverage
npm run lint                  # ng lint (angular-eslint)
npx ng lint --fix              # auto-fix what ESLint safely can
npm run mock-api                # json-server src/assets/db.json -> http://localhost:3000
```

Run a single spec file or filter by name (Vitest-based `@angular/build:unit-test` runner):

```bash
ng test --include src/app/components/todos/todos.spec.ts
ng test --filter "Todos"        # regex against suite/test names
```

There is no `dev` script combining `ng serve` + `json-server` yet (see `docs/JSON_SERVER_SETUP.md` for how to add one with `concurrently`); run `npm start` and `npm run mock-api` in separate terminals when a component needs the mock API.

### Pre-commit

Husky's `.husky/pre-commit` currently runs `npm run lint` only (the README describes an older setup that also ran `npm test`; verify `.husky/pre-commit` if this matters). Lint failures block the commit.

## Architecture

- **Standalone components only** — no NgModules. Every component/service sets `imports: []` directly and is wired into `app.routes.ts` (`src/app/app.routes.ts`). New routed demos must be added there.
- **DI via `@Service()`, not `@Injectable()`** — this Angular version's shorthand for `@Injectable({ providedIn: 'root' })`. Use `@Service()` on new services for consistency (see `src/app/services/users.ts` for the documented rationale).
- **`inject()` over constructor injection** everywhere (`private http = inject(HttpClient)`), including in `ResolveFn`s (`src/app/resolvers/dashboard-resolver.ts`).
- **Signals + RxJS interop**: components commonly convert an HTTP observable to a signal at the field-initializer level with `toSignal(obs$, { initialValue: [] })` (see `src/app/components/todos/todos.ts`) rather than subscribing in `ngOnInit`.
- **Subscription cleanup**: prefer `takeUntilDestroyed()` (or the `AsyncPipe`) for anything subscribed outside a one-shot resolver/`toSignal`. `src/app/app.ts` intentionally demonstrates several cleanup styles side by side (manual `Subscription` + `ngOnDestroy`, `takeUntilDestroyed(destroyRef)`, `takeUntilDestroyed()` with no arg) — treat it as a reference, not a pattern to copy wholesale into new components.
- **Caching pattern**: services that need a shared/cached HTTP stream store one `Observable` field and multicast it with `shareReplay({ bufferSize: 1, refCount: false })`, invalidating by setting the field back to `undefined` after a mutation (`src/app/services/users.ts`). Use this instead of a manual `BehaviorSubject` when caching a request.
- **`InjectionToken` for environment-driven config**: `API_URL` (`src/app/components/core/tokens/api-url.token.ts`) is provided in `app.config.ts` from `environment.apiUrl` and injected where needed, so tests can override it with a fake value. See `docs/INJECTION_TOKEN.md` for when to reach for a token vs. a plain exported constant.
- **Route-level data loading**: use a `ResolveFn` + `forkJoin` to fetch parallel, render-blocking data before navigation completes (`src/app/resolvers/dashboard-resolver.ts` feeding `Dashboard`). Non-blocking or below-the-fold data should be fetched after initial render or with `@defer` instead, per the notes in `docs/DOC.md`.
- **Mock API data**: `src/assets/db.json` backs `json-server`; each top-level key becomes a REST resource (`/users`, `/products`, `/getTodos`, ...). Endpoint names are case-sensitive.
- **`profile/` is a mini vertical slice** (`profile/components`, `profile/models`, `profile/services`) — when a demo grows beyond a single component, follow this components/models/services split rather than flattening into `src/app/components/`.

## Testing conventions

- Runner is Vitest via the Angular `unit-test` builder (not Karma/Jasmine), configured through `tsconfig.spec.json` (`vitest/globals` types) — `describe`/`it`/`expect` are global, no import needed.
- HTTP-backed components/services are tested with `provideHttpClient()` + `provideHttpClientTesting()` and `HttpTestingController`, asserting on request URL/method and using `.flush()` for responses; always call `httpMock.verify()` in `afterEach`. See `src/app/components/todos/todos.spec.ts` for the full pattern, including handling a request fired eagerly from a field initializer (`toSignal`) inside `beforeEach`.
