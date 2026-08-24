# Auth Flow — Quick Revision

One-pager for talking through login → interceptors → token refresh out loud in an interview.
For exhaustive detail see `interceptor-cheat-sheet.md`; this file is the short version to skim right before you walk in.

## The story in one sentence

Login gets you two tokens; every request after that gets the access token stapled on automatically; if the server says the access token is stale, one shared refresh call fixes it and retries — everything else waits its turn instead of also refreshing.

## The pieces (who does what)

| File | Job |
|---|---|
| `features/login/login.ts` | Form → `authService.login()` → navigate on success |
| `core/auth/auth.ts` | Owns the tokens (`signal`), exposes `login()`, `refresh()`, `logout()` |
| `core/interceptors/tokens/skip-interceptor-interceptor.ts` | `SKIP_AUTH` — an `HttpContextToken` to opt a request out of the auth interceptor |
| `core/interceptors/auth-interceptor.ts` | Attaches `Authorization` header; catches 401 → refresh → retry |
| `core/interceptors/error-interceptor.ts` | Maps HTTP status → console message (global, last resort) |
| `core/interceptors/retry-interceptor.ts` | Retries transient 5xx on GET only, with backoff |
| `core/interceptors/logging-interceptor.ts` | Dev-only request/response timing log |
| `app.config.ts` | Registers the chain, in order |

## The flow, step by step

```
1. LOGIN
   Login.login() → Auth.login(username, password)
     POST /auth/login  (carries SKIP_AUTH → no Authorization header attached)
     response { accessToken, refreshToken } → stored in signals

2. NORMAL REQUEST
   any http call → authInterceptor
     no SKIP_AUTH + token exists → clone req, add "Authorization: Bearer <accessToken>"
     → next(clone)

3. TOKEN EXPIRED (401)
   authInterceptor catchError:
     is it a 401?
       → compare the Authorization header the FAILED request was sent with
         vs the CURRENT token on the Auth service
       → same?  it's genuinely stale → call authService.refresh()
       → different? someone already refreshed while this request was in flight
                     → just retry with the current token, no new refresh call

4. REFRESH (single-flight)
   Auth.refresh():
     if a refresh is already in progress → return that same Observable (shareReplay(1))
     else → POST /auth/refresh (carries SKIP_AUTH) → store new tokens
            → finalize(() => refreshInProgress$ = null)

5. RETRY
   switchMap after refresh succeeds → clone the ORIGINAL request with the new token → next(retried)

6. REFRESH ITSELF FAILS
   catchError around refresh() → authService.logout() → router.navigate(['/login'])
   (no retry of the refresh call — fail fast)
```

## Why it doesn't infinite-loop

Two separate guards, and it's worth naming both:

1. **Structural** — `/auth/login` and `/auth/refresh` are called with `SKIP_AUTH` in their `HttpContext`. The interceptor's first line bails out for those requests, so the refresh call can never trigger *another* refresh of itself.
2. **Single-flight dedupe** — `refresh()` stores its in-flight Observable on the service and hands the *same* one to every concurrent caller via `shareReplay(1)`. A straggler that arrives after the refresh already resolved doesn't get a second refresh call — the token-comparison check (step 3) sends it straight to a retry instead.

That token-comparison check is the subtle bit: without it, 5 simultaneous 401s can produce 2 refresh calls instead of 1 (a late request arrives just after `refreshInProgress$` was reset to `null` by `finalize`).

## "Queuing" — what it actually means here

Not a manual queue/array. It's `shareReplay(1)` multicasting one HTTP call to N subscribers: every request that hits `refresh()` while one is already in flight subscribes to the *same* Observable and gets the *same* emitted tokens when it resolves. That's the "queue."

## Registration order (and why)

```ts
withInterceptors([
  ...(environment.production ? [] : [loggingInterceptor]),
  errorInterceptor,
  retryInterceptor,
  authInterceptor,
])
```

Request travels top → bottom; response bubbles bottom → top. `authInterceptor` sits **closest to the backend** on purpose — it gets first look at a 401 and can silently resolve it (refresh + retry) *before* `retryInterceptor` mistakes it for a transient error or `errorInterceptor` logs it as a failure.

## 60-second spoken answer

> "Login hits `/auth/login` with a context flag that tells my interceptor to skip it, and stores the two tokens in signals. Every other request goes through an auth interceptor that clones the request and adds a Bearer header. If a response comes back 401, I catch it, check whether the token I sent is still the current one — if it's already stale because another request refreshed it first, I just retry with the fresh token. Otherwise I call a `refresh()` method on the auth service that's guarded so only one refresh call is ever in flight — `shareReplay(1)` — everyone else awaits that same call. Once it resolves I retry the original request with the new token. If the refresh call itself fails, I log the user out and redirect to login, no retry. Two things stop it looping forever: the refresh and login requests carry a skip flag so they can never re-enter this same interceptor, and the single-flight guard means concurrent 401s produce one refresh, not N."

## Rapid-fire Q&A

- **Why `signal()` for tokens, not a plain field?** So any component/template reading `authService.accessToken()` reacts automatically; also keeps state in one place instead of duplicating into `localStorage` reads scattered around.
- **Why not `localStorage`?** XSS can read `localStorage`. In-memory-only is safer but dies on refresh (tradeoff, noted as a TODO in `auth.ts` — real fix is an HttpOnly cookie for the refresh token).
- **Why `switchMap` and not `mergeMap` after refresh?** The retry must wait for the new token to exist first — `switchMap` sequences into the refreshed state; `mergeMap` would too here since there's only one source, but `switchMap` communicates "cancel anything stale and move to the new state" as intent.
- **Why does retry-interceptor only touch GET?** Retrying a non-idempotent POST (e.g. `create order`) 3× can create 3 orders. GET is safe to repeat.
- **What does the error-interceptor do that the auth-interceptor doesn't?** It's a global, generic status→message mapper (last resort logging). It never attempts a refresh — that's owned entirely by `authInterceptor`, which sits closer to the backend and gets to resolve 401s first.
