# Angular Interceptor Cheat Sheet

Revision reference for the HTTP interceptor project (`core/auth`, `core/interceptors`, `features/login`, `features/users`). Stack: Angular 22, standalone, functional interceptors, DummyJSON auth. See `docs/interceptor-confg.md` for the build log and `INTERCEPTOR.md` for the original brief.

## 1. Quick answers

- **What is an interceptor?** Middleware for `HttpClient` — every request and response passes through it, chain-of-responsibility style, before hitting your code or the network.
- **Why use one instead of repeating logic per call?** DRY for cross-cutting concerns (auth, logging, error, retry) — and impossible to forget, since a new call site can't accidentally skip it.
- **Functional vs class-based?** `HttpInterceptorFn` is the default since Angular 15. Class-based (`implements HttpInterceptor`) survives mainly for legacy `HTTP_INTERCEPTORS`-DI codebases mid-migration, via `withInterceptorsFromDi()`.
- **How do you register one?** `provideHttpClient(withInterceptors([...]))` in `app.config.ts`.
- **What's the execution order?** Array order = request order. Response is the *reverse* — the last entry in the array sits closest to the backend and sees the raw response first.
- **Why `req.clone()` instead of mutating `req`?** `HttpRequest` is immutable (readonly props) — cold observables can be replayed/retried, so mutation would leak state (e.g. doubled headers) across attempts.
- **How do you skip an interceptor for one request?** `HttpContextToken` + `req.context.get()/.set()` — type-safe, no fragile URL-string matching.
- **How do you stop an infinite refresh loop?** The refresh request itself carries the skip-token — it structurally can never re-enter the interceptor that would try to refresh it again.
- **Five requests 401 at once — how many refresh calls?** One, if the in-flight refresh observable is shared via `shareReplay(1)` on the singleton service. Stragglers that arrive after that refresh already resolved get caught by comparing their stale token against the current one instead of firing a second refresh.
- **Interceptor-level vs component-level error handling?** Interceptor: same response no matter who called it (401 → logout, 5xx → toast). Component: depends on what the user was doing (inline form validation message).
- **How do you unit test one?** Call the function directly with a mocked `next()`, or go through `TestBed` with `provideHttpClient(withInterceptors([...]))` + `provideHttpClientTesting()` for the real chain.
- **What does Angular's built-in XSRF interceptor do?** Reads an `XSRF-TOKEN` cookie, echoes it as an `X-XSRF-TOKEN` header on unsafe same-origin requests. Doesn't protect cross-origin calls — that needs CORS plus its own token strategy.

## 2. The registered pipeline

```
component → logging → error → retry → auth → backend
```

Response bubbles back the other way — `auth` gets first look at a 401 and can resolve it (refresh + retry) before `retry` or `error` ever see a failure.

## 3. The 14 stages

### 01 — Bearer token attach ⭐⭐⭐
On every outgoing request (unless skipped or no token exists), clone the request and set `Authorization: Bearer <token>`.

```ts
if (req.context.get(SKIP_AUTH) || !authService.getAccessToken()) {
  return next(req);
}
const clone = req.clone({
  setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
});
return next(clone).pipe(/* … */);
```
> Attaching the header is the easy 10%; the interceptor's real job starts when that header turns out to be wrong.

### 02 — Detecting 401 ⭐⭐⭐
`catchError` on the outgoing request checks `error instanceof HttpErrorResponse && error.status === 401`.

**Real bug:** the non-401 branch fell through with no return, which TypeScript rightly rejected: "not all code paths return a value." `catchError` must return an observable on *every* path — recover, or re-throw with `throwError(() => error)`. No silent fallthrough.

### 03 — Refresh token flow ⭐⭐⭐
On 401: call `refresh()`, then `switchMap` into a retried clone carrying the new token.

```ts
return authService.refresh().pipe(
  switchMap(() => {
    const retried = req.clone({
      setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
    });
    return next(retried);
  }),
  catchError((refreshError) => { authService.logout(); return throwError(() => refreshError); }),
);
```
> `switchMap`, not `mergeMap` — retry must wait for the new token to exist before firing.

### 04 — Concurrent 401s ⭐⭐⭐ (senior differentiator)
Guard `refresh()` on the singleton `Auth` service with a shared in-flight observable — every concurrent caller awaits the same one instead of firing new refresh calls.

```ts
private refreshInProgress$: Observable<TokenPair> | null = null;

refresh() {
  if (!this.refreshInProgress$) {
    this.refreshInProgress$ = this.http.post<TokenPair>(/* … */).pipe(
      tap((res) => { this.setAccessToken(res.accessToken); this.setRefreshToken(res.refreshToken); }),
      shareReplay(1),
      finalize(() => (this.refreshInProgress$ = null)),
    );
  }
  return this.refreshInProgress$;
}
```

**Real bug:** 5 simultaneous 401s produced *2* refresh calls, not 1 — a straggler's response arrived *after* the first refresh already resolved and reset the guard to `null`. Fix: before calling `refresh()`, compare the token the failed request was actually sent with against the *current* token — if they differ, someone already refreshed; just retry with the current one.

```ts
const failedToken = clone.headers.get('Authorization');
const currentToken = `Bearer ${authService.getAccessToken()}`;
if (failedToken !== currentToken) {
  return next(req.clone({ setHeaders: { Authorization: currentToken } }));
}
// else: genuinely stale — call refresh()
```

### 05 — Retry the original request ⭐⭐
Same clone-with-new-header pattern as stage 01, just triggered post-refresh instead of pre-emptively. The original request object (`req`) is what gets re-cloned — never the already-consumed `clone`.

### 06 — Refresh failure & loop prevention ⭐⭐⭐
If `/auth/refresh` itself errors, `logout()` immediately — don't retry the refresh.

> The infinite-loop fix is structural, not a counter: the refresh call carries `SKIP_AUTH`, so it can never re-enter this same interceptor and trigger another refresh attempt.

### 07 — Logout ⭐⭐
Clear both signals, navigate to `/login`. Interceptors aren't components — inject `Router` the same way as `Auth` via `inject()` to redirect from inside the catch block.

> Client-side logout removes the key from your pocket. Server-side logout (a real `POST /auth/logout`) changes the lock — DummyJSON has no such endpoint, so this project only demonstrates the former.

### 08 — Global error handling ⭐⭐⭐
A separate interceptor maps status → strategy, not one generic message for everything.

```ts
switch (error.status) {
  case 400: /* invalid request */ break;
  case 401: /* last resort — auth already tried refresh */ break;
  case 403: /* access denied */ break;
  case 404: /* not found */ break;
  case 409: /* conflict */ break;
  case 429: /* slow down */ break;
  default: if (error.status >= 500) /* server problem */ break;
}
```
**Boundary:** auth interceptor *owns* the 401 lifecycle. Error interceptor's 401 case is reporting only — never a second refresh attempt.

### 09 — Retry transient errors ⭐⭐
GET-only, only on 502/503/504, with backoff — never blindly on POST.

```ts
if (req.method !== 'GET') return next(req);

return next(req).pipe(retry({
  count: 3,
  delay: (error, n) => {
    if (![502, 503, 504].includes(error.status)) throw error;
    return timer(n * 1000);
  },
}));
```
> Retrying a non-idempotent `POST /orders` three times can create three orders. The method guard exists specifically to prevent that.

### 10 — withCredentials ⭐
`{ withCredentials: true }` tells the browser to attach cookies to a cross-origin request and accept `Set-Cookie` from the response. Pairs with server-side `Access-Control-Allow-Credentials: true` — cannot combine with a wildcard `Access-Control-Allow-Origin: *`.

**Limitation:** DummyJSON returns tokens in the JSON body, not a cookie — nothing to demo here. Explain the HttpOnly-cookie design conceptually; don't fake it.

### 11 — HttpContext / SKIP_AUTH ⭐⭐⭐
```ts
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

// call site
this.http.post(url, body, { context: new HttpContext().set(SKIP_AUTH, true) });
```
> Type-safe and composable — beats matching on URL substrings, which breaks the moment a route changes.

### 12 — Logging ⭐⭐
`tap({ next, error })` around `next(req)`, filtering to `instanceof HttpResponse` so only the final event logs, not upload/download progress ticks.

> Positioned closest to the backend in this build — a request that 401s then succeeds after refresh logs *twice* (once per real network call), which is arguably more honest than logging only the final outcome.

### 13 — Registration & order ⭐⭐⭐
```ts
provideHttpClient(
  withInterceptors([
    errorInterceptor,
    retryInterceptor,
    authInterceptor,
    ...(environment.production ? [] : [loggingInterceptor]),
  ]),
)
```
**Real bug:** `environment.production ? [] : loggingInterceptor` mixed an array and a bare function as one array element — type error, and wouldn't have conditionally omitted anything even if it compiled. Fix: spread a conditional array — `...(cond ? [] : [x])`.

## 4. Why this exact order (the one rule that isn't a style preference)

`authInterceptor` must sit **closer to the backend** than `errorInterceptor` and `retryInterceptor`. Response flow is the reverse of the array, so the last entry sees the raw response first — that's what lets `auth` silently resolve a 401 via refresh-and-retry before `error` ever reports it as a failure, and before `retry` mistakes it for a transient 5xx. Everything else in the order (where `logging` sits, whether `error` comes before `retry`) is a legitimate design choice — this one isn't.

## 5. Scenario drills

| Scenario | Answer |
|---|---|
| Five API calls happen simultaneously, all return 401. | One shared refresh call via `shareReplay(1)` on the singleton service; stragglers compare their stale token against the current one instead of re-triggering refresh. |
| The refresh-token API also returns 401. | Inner `catchError` on the refresh call fires `logout()` and redirects — no retry of the refresh itself, no loop, because the refresh request is exempt from re-entering this interceptor. |
| Your retry interceptor retries a POST three times. | Dangerous if the POST isn't idempotent — three retries can create three resources. Guard retry to GET only (or explicitly idempotent methods). |
| The API returns 500 for 30 seconds straight. | No — cap retry count and use backoff; unbounded retry against a genuinely down service just adds load. Let it fail after N attempts and surface the error. |
| The login request is getting an Authorization header. | Mark it with `SKIP_AUTH` via `HttpContext` at the call site — the interceptor checks that flag before attaching anything. |
| User has the app open in multiple tabs; the access token expires. | In-memory-only tokens mean each tab has independent state — this project accepts that tradeoff (see §3.10); a production fix is a `BroadcastChannel`/storage-event sync or moving to an HttpOnly cookie shared across tabs by the browser itself. |
| Your interceptor causes an infinite refresh loop. | First check: does the refresh call itself carry the skip-token? That's the single most common cause — the refresh request re-entering its own interceptor. |
| Design authentication using HttpOnly cookies instead of localStorage. | Access token in memory only; refresh token in an HttpOnly/Secure/SameSite cookie the server sets on login. On app bootstrap, call refresh with `withCredentials: true` — the browser attaches the cookie automatically, JS never touches it, so XSS can't steal it. |

## 6. Bugs you actually hit

Real ones from this build — better interview material than any rehearsed answer, because you can describe the debugging, not just the fix.

1. **Missing return in `catchError`** — non-401 branch fell through, TS caught it: "not all code paths return a value." *Fix: explicit `return throwError(() => error)` for the default case.*
2. **`ng g interceptor` for a context token** — scaffolds an `HttpInterceptorFn` stub; there's no schematic for `HttpContextToken`, it's just a plain constant. *Fix: hand-write it, delete the generated spec.*
3. **`formControl="x"` vs `[formControl]="x"`** — string attribute vs property binding; the unbound version silently did nothing. *Fix: square brackets.*
4. **`FormControl.value` is `string | null`** by default, but the login call needed plain `string`. *Fix: `new FormControl('', { nonNullable: true })`.*
5. **Button called `getMe()` instead of `callMe()`** — the former returns an observable but never subscribes, so clicking did nothing visible. *Fix: wire the click to the method that actually subscribes.*
6. **Ternary mixing array and function types** in the interceptor array — `cond ? [] : loggingInterceptor`. *Fix: `...(cond ? [] : [loggingInterceptor])`.*
7. **Registration order had `auth` outermost** — meant `error`/`retry` would see a raw 401 before auth got a chance to refresh it. *Fix: auth moved closest to the backend.*
8. **2 refresh calls instead of 1** for 5 concurrent 401s — a straggler arrived after the first refresh had already reset the in-flight guard. *Fix: compare the failed request's token against the current one before deciding to refresh again.*
