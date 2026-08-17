Steps to create interceptors in Angular:

src/app/
├── core/
│ ├── auth/
│ │ └── auth.ts ← AuthService (login/logout/token state)
│ └── interceptors/
│ ├── auth-interceptor.ts
│ ├── error-interceptor.ts
│ ├── retry-interceptor.ts
│ └── logging-interceptor.ts
│
├── features/
│ ├── login/
│ │ ├── login.ts
│ │ ├── login.html
│ │ └── login.css
│ └── users/
│ ├── users.ts
│ ├── users.html
│ └── users.css
│
├── app.config.ts ← interceptor registration goes here
└── app.routes.ts

# plain folders (no CLI schematic for these)
mkdir -p src/app/core/auth
mkdir -p src/app/core/interceptors
mkdir -p src/app/features/login
mkdir -p src/app/features/users

# AuthService
ng g service core/auth/auth

# interceptors — functional by default in this Angular version, one per type
ng g interceptor core/interceptors/auth
ng g interceptor core/interceptors/error
ng g interceptor core/interceptors/retry
ng g interceptor core/interceptors/logging

# the one demo/feature component to actually call the API
ng g component features/login
ng g component features/users


now in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),   // ← new line
  ],
};


Questions and Answer

1. Functional vs class-based — when to still use class-based?
   Legacy migration — huge codebase already has HTTP_INTERCEPTORS DI providers; rewriting all at once isn't worth the risk. Angular lets both coexist via withInterceptorsFromDi().
   Complex DI dependencies — if the interceptor needs many injected services with constructor-based testing/mocking patterns your team already has tooling for (e.g. heavy use of TestBed.overrideProvider), a class can be more ergonomic than inject() calls inside a function.
   Library authors targeting older Angular consumers who haven't adopted functional interceptors yet.
   Interview answer in one line: "Functional is the default for new code; class-based survives mainly for legacy DI-heavy codebases mid-migration."

2. Chain execution order (3 interceptors: A, B, C)
   Registered as withInterceptors([A, B, C]).

Request: A → B → C → Backend
Response: Backend → C → B → A
Think of it as nested function calls — A(req, () => B(req, () => C(req, backendCall))). Whichever interceptor is outermost (first in the array) is the first to touch the outgoing request and the last to touch the incoming response — like a wrapper around everything inside it.

Practical implication: put auth first (needs to modify the request before it leaves), put global error handling so it wraps everything (works from any position since it uses catchError in the pipe, but early = it also sees earlier interceptors' failures).

3. Skipping an interceptor for one request

// token
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

// interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
if (req.context.get(SKIP_AUTH)) return next(req);
return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

// call site
this.http.get('/public-endpoint', { context: new HttpContext().set(SKIP_AUTH, true) });
Why not just check the URL string? — because HttpContext is type-safe, doesn't leak matching logic into the interceptor, and composes with multiple flags per request.

4. Refresh-token interceptor without infinite loops
   Core idea: catch 401, refresh once, retry the original request, and guard against a stack of parallel 401s all trying to refresh at once.

let refreshInProgress$: Observable<string> | null = null;

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
return next(req).pipe(
catchError(err => {
if (err.status !== 401 || req.context.get(SKIP_AUTH)) {
return throwError(() => err);
}
if (!refreshInProgress$) {
        refreshInProgress$ = authService.refreshToken().pipe(
shareReplay(1),
finalize(() => (refreshInProgress$ = null))
        );
      }
      return refreshInProgress$.pipe(
switchMap(newToken =>
next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
),
catchError(refreshErr => {
authService.logout();
return throwError(() => refreshErr);
})
);
})
);
};
Key mechanisms to say out loud in the interview:

shareReplay(1) on the refresh call — multiple simultaneous 401s share one in-flight refresh instead of each triggering their own.
Mark the retry request (e.g. req.context.set(SKIP_AUTH_RETRY, true) or check a flag) so if the retried request also 401s, you don't refresh again — you logout instead. Otherwise: infinite loop.
The refresh call itself must bypass this interceptor (SKIP_AUTH context) or it'll recurse into itself. 5. Why req.clone(), not mutate
HttpRequest is immutable by design — its properties are readonly, so mutation isn't even syntactically possible; you're forced through .clone(). The design reasons:

The same request object can be replayed (retries, multiple subscribers) — if interceptors mutated it in place, a retry would carry state changes from the first attempt (e.g. double-added headers).
Predictability in a chain of multiple interceptors — each one gets a clean, explicit diff (clone({...})) rather than silent shared-object side effects. 6. Unit testing an interceptor
Two accepted approaches:

A. Direct function call (fast, no TestBed) — for functional interceptors, since they're just functions:

const next = vi.fn(() => of({} as HttpEvent<unknown>));
const req = new HttpRequest('GET', '/api/data');
authInterceptor(req, next);
expect(next).toHaveBeenCalledWith(
expect.objectContaining({ headers: expect.anything() })
);
B. Integration style via TestBed + HttpTestingController (what this repo already uses for services, per todos.spec.ts):

TestBed.configureTestingModule({
providers: [
provideHttpClient(withInterceptors([authInterceptor])),
provideHttpClientTesting(),
],
});
httpMock.expectOne(req => req.headers.has('Authorization'));
Say both, but B is preferred when you want to verify it works in the real registered chain, not in isolation.

7. Interceptor-level vs component-level error handling
   Interceptor Component (catchError in a subscribe/pipe)
   Scope Every HTTP call, global One specific call site
   Use for Cross-cutting: 401→logout, 5xx→toast, network-down banner Business-specific: "show inline validation error on this form"
   Risk if misused Swallowing errors globally hides context-specific handling downstream Duplicated boilerplate if the same handling is needed everywhere
   Rule of thumb: if the response to the error is the same no matter which screen triggered it, it's interceptor-level; if it depends on what the user was doing, it's component-level. Often both exist together — interceptor logs/toasts generically, component still gets the error via catchError (interceptor re-throws with throwError) to update local UI state.

8. Angular's built-in XSRF interceptor
   Angular ships CSRF protection automatically when you use HttpClient with cookies:

Server sets a cookie (default name XSRF-TOKEN) containing a random token.
Angular's built-in interceptor reads that cookie and echoes it back as a header (default X-XSRF-TOKEN) on every mutating request.
Server compares cookie value vs header value — since a cross-site attacker can't read your cookie (same-origin policy), they can't forge the matching header.
Configure via withXsrfConfiguration():

provideHttpClient(
withXsrfConfiguration({
cookieName: 'CSRF-TOKEN',
headerName: 'X-CSRF-TOKEN',
})
)
Note it only kicks in for requests considered "unsafe" (non-GET/HEAD) and only same-origin — good gotcha to mention if asked "does it protect cross-origin API calls?" (answer: no, it's same-origin by design; cross-origin needs CORS + separate token strategy).
