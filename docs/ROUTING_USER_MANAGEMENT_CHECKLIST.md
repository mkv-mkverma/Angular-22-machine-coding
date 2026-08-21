# Routing + User Management — Interview Checklist

Quick revision doc for the `feature/routing` branch: Angular Router concepts as
demonstrated by `src/app/features/user-management/`.

## 1. Route setup (this feature)

```
/user                 -> UserManagement (list)
/user/:userId         -> UserProfile (nested under /user)
/user/:userId/add     -> AddUser (nested under UserProfile)
```

- Top-level route registered in [app.routes.ts](../src/app/app.routes.ts) with
  `children: usersManagementRoutes` imported from a **feature-owned route
  file** ([user-management.route.ts](../src/app/features/user-management/user-management.route.ts)) —
  keeps `app.routes.ts` from growing a giant nested tree.
- Child routes render via `<router-outlet>` inside the parent component
  (`UserManagement.html`, `UserProfile.html`).

**Q: Why split routes into a per-feature `*.route.ts` file instead of nesting
inline in `app.routes.ts`?**
A: Keeps the feature self-contained/movable, avoids one massive route file,
mirrors lazy-loading structure if you later switch to `loadChildren`.

## 2. Reading route params — 3 ways shown side by side

`UserProfile` ([user-profile.ts](../src/app/features/user-management/user-profile/user-profile.ts))
deliberately shows two styles for revision:

| Style | Code | Reactive? | Needs cleanup? |
|---|---|---|---|
| **Input binding** (preferred) | `userId = input.required<string>();` | Yes | No — Angular manages it |
| **toObservable + switchMap** | `toObservable(this.userId).pipe(switchMap(...))` | Yes | No (toSignal unsubscribes on destroy) |
| **ActivatedRoute.paramMap subscribe** | `this.activatedRoute.paramMap.pipe(takeUntilDestroyed(...)).subscribe(...)` | Yes | Yes — must `takeUntilDestroyed` manually |

**Route param → component input binding requires** (see
[app.config.ts](../src/app/app.config.ts)):
```ts
provideRouter(routes, withComponentInputBinding())
```
Without this, `input.required<string>()` bound to `:userId` would never populate.

**Q: Why does the child route (`add`) also need params from the parent
(`userId`)?**
A: `withRouterConfig({ paramsInheritanceStrategy: 'always' })` — by default
child routes only see their *own* params/data, not the parent's. `'always'`
merges parent + child params so a deeply nested component can still read
`userId` via input binding.

**Q: `switchMap` vs `mergeMap`/`concatMap` for route-param-driven HTTP calls?**
A: `switchMap` — a new route param should cancel the in-flight request for the
previous one (avoid race conditions / stale data flashing in).

## 3. Signals + RxJS interop patterns used

- `toSignal(obs$, { initialValue: [] })` — fetch-on-init pattern, no
  `ngOnInit`/manual subscribe (`UserManagement`).
- `toObservable(signal).pipe(switchMap(...))` then `toSignal(...)` — turn a
  signal (route param input) back into a stream to `switchMap` an HTTP call,
  then back into a signal (`UserProfile`).
- `computed()` for derived state:
  ```ts
  users = computed(() => this.allUsers().filter(u => !this.deletedIds().includes(u.id)));
  ```
  Local **optimistic delete** — `allUsers` (from `toSignal`) is read-only, so
  deletions are tracked in a separate `deletedIds` signal and filtered out via
  `computed`, rather than mutating the fetched array.

**Q: Why not just refetch the user list after a delete?**
A: Extra round trip for something the client already knows the outcome of;
optimistic local filtering is instant. Trade-off: if the DELETE fails
server-side but the UI already emitted success, list and server state
diverge — worth mentioning as a follow-up ("what would you do differently
in production?").

## 4. Parent/child communication

- `User` (list item) → `UserManagement` (list) via `output<number>()`:
  ```ts
  deleted = output<number>();
  delete(userId) { this.userManagementService.deleteUser(userId).subscribe({ next: () => this.deleted.emit(userId) }) }
  ```
- `UserManagement` listens with `(deleted)="onUserDeleted($event)"` and updates
  `deletedIds`.

**Q: `output()` vs `@Output() EventEmitter`?**
A: `output()` is the signals-era function API (Angular 17+), same purpose,
no `EventEmitter` import, slightly different typing/completion semantics.

## 5. Things to flag/fix if asked "review this code"

Known rough edges in the current implementation — good to know if an
interviewer says "spot the bug":

- **`updateUser(id)` in [user-management.ts (service)](../src/app/features/user-management/service/user-management.ts)
  doesn't `return` the HTTP call** — it fires but the caller can never
  subscribe/await it, and per CLAUDE.md convention HTTP calls should return
  the `Observable`.
- **No caching (`shareReplay`) on `getUsers()`** — the repo's documented
  convention (`src/app/services/users.ts`) is to multicast/cache list
  fetches; this service refetches every time `UserManagement` is
  constructed.
- **`AddUser.onSubmit()` hardcodes `this.router.navigate(['/user', 2], ...)`**
  — always navigates to user id `2` regardless of the created user's real id
  (the create response isn't used for the id, just logged).
- Delete is **optimistic-only, no rollback** on error (see §3).

## 6. Route resolvers — `dashboardResolver` (`/` route)

```ts
{
  path: '',
  component: Dashboard,
  title: 'Dashboard',
  pathMatch: 'full',
  runGuardsAndResolvers: 'always',
  resolve: {
    dashboardResolver,
    dashboardResolverTest,
  },
  data: { message: 'Hello' },
}
```
([app.routes.ts](../src/app/app.routes.ts))

- `resolve` is keyed by the **data key** the result lands under
  (`route.snapshot.data['dashboardResolver']`), not by a fixed name — the key
  you pick here is the key you read later.
- The resolver itself is a plain function matching `ResolveFn<T>`
  ([dashboard-resolver.ts](../src/app/resolvers/dashboard-resolver.ts)):
  ```ts
  export const dashboardResolver: ResolveFn<DashboardResolverData> = () => {
    const api = inject(Dashboard);
    return forkJoin({ users: api.getUsers(), permissions: api.getPermissions(), features: api.getFeatures() });
  };
  ```
  `inject()` works here because a `ResolveFn` runs in an injection context —
  no constructor/class needed, just a function.
- **`forkJoin`** runs the three calls in parallel and waits for *all* to
  complete before the object resolves — matches CLAUDE.md's guidance to use
  resolvers for "parallel, render-blocking data" that should be ready
  *before* navigation completes (as opposed to `@defer` or a post-render
  fetch for non-critical data).
- Consumed in `Dashboard` via `this.route.snapshot.data['dashboardResolver']`
  — a **snapshot** read is fine here (unlike `UserProfile`'s use of
  `paramMap`) because a resolver only ever runs once per navigation; there's
  no later emission to miss.
- **Multiple resolvers on one route** — `dashboardResolverTest` was added
  alongside `dashboardResolver` purely to show that `resolve` takes a *map*;
  each entry runs (and is awaited) independently and lands under its own
  key. It also demonstrates the **full `ResolveFn` signature**:
  ```ts
  export const dashboardResolverTest: ResolveFn<string> = (
    activatedRoute: ActivatedRouteSnapshot,
    _routerState: RouterStateSnapshot,
  ) => activatedRoute.paramMap.get('id') || '';
  ```
  Resolvers (like guards) receive `(route: ActivatedRouteSnapshot, state:
  RouterStateSnapshot)` — `dashboardResolver` just doesn't need them since it
  only reads injected services, not the URL itself.
- **`data: { message: 'Hello' }`** — static route data, sits in the *same*
  `route.snapshot.data` bag as resolved values (`Dashboard` reads it via
  `this.route.snapshot.data['message']`). Difference from `resolve`: `data`
  is known synchronously at route-config time; `resolve` is computed
  (usually async) per-navigation.
- **`runGuardsAndResolvers: 'always'`** — controls *when* guards/resolvers
  re-run for a route that's already active (activating/deactivating a route
  always runs them regardless of this setting). Default is `'paramsChange'`
  — only re-runs on path/path-param changes; `'always'` forces a re-run on
  *every* navigation to this route, even re-navigating to the exact same
  URL. Other values: `'pathParamsChange'`, `'paramsOrQueryParamsChange'`,
  `'pathParamsOrQueryParamsChange'`, or a custom
  `(from, to) => boolean`. Useful here so `dashboardResolverTest`
  demonstrably re-reads `paramMap` each time, but in production it's a perf
  cost — only reach for `'always'` when you specifically need fresh data on
  every re-entry (e.g. after a mutation elsewhere navigates back).

**Q: Resolver vs `toSignal`-in-component (as `UserManagement`/`UserProfile`
do) — when would you pick each?**
A: Resolver blocks navigation until data is ready — good for "don't show an
empty/loading dashboard, wait for the parallel calls." `toSignal` in the
component lets the route navigate immediately and shows a loading state
while data streams in — better UX when data isn't render-critical or when
you want the shell to paint immediately (this is also why `UserManagement`
and `UserProfile` don't use resolvers: their `toSignal` calls are per-item
fetches, not "block the whole page" data).

**Q: What happens if one of the three `forkJoin` calls errors?**
A: `forkJoin` fails fast — if any inner observable errors, the whole resolve
errors and navigation is cancelled (no partial `dashboardData`). Worth
mentioning: for resolvers you often want each call to catch its own error
(e.g. `catchError(() => of(null))`) so one flaky endpoint doesn't block the
whole route.

**Q: Why does `resolve: { dashboardResolver }` use shorthand property
syntax?**
A: `resolve` takes a map of `key: ResolveFn`; `{ dashboardResolver }` is just
`{ dashboardResolver: dashboardResolver }` — the imported function name
becomes both the data key and the resolver reference.

## 7. Guards — `canMatch` and friends

`src/app/core/guards/` exists in this repo but is still empty — guards are
the next thing to add. Reference example (not yet in the codebase):

```ts
{
  path: 'users/:userId',                // <your-domain>/users/<uid>
  component: UserTasksComponent,
  children: userRoutes,
  canMatch: [dummyCanMatch],
  data: { message: 'Hello!' },
  resolve: { userName: resolveUserName },
  title: resolveTitle,
}
```

- **Functional guards** (Angular 15+) are just functions matching a `*Fn`
  type — `CanActivateFn`, `CanMatchFn`, `CanDeactivateFn`, `CanActivateChildFn`
  — same shape as `ResolveFn`: run in an injection context, so `inject()`
  works without a class/`@Injectable`. This repo already favors functional
  patterns (`ResolveFn`, `HttpInterceptorFn` in `core/interceptors/`), so
  guards here should follow the same style, not the old class-based
  `CanActivate` interface.

- **`canMatch` vs `canActivate`** — the one most worth knowing cold:
  - `canActivate` runs *after* a route has already matched — if it returns
    `false`, navigation is simply blocked (often left showing a blank
    outlet or previous URL).
  - `canMatch` runs *during* route matching, *before* a route is selected —
    if it returns `false`, the router treats the route as if it doesn't
    match at all and **falls through to the next route with the same
    path** (or `**`). This is what makes `canMatch` the right tool for
    things like "show a different component (or 404) at the same URL
    depending on a feature flag/auth state," and it's also what gates
    lazy-chunk loading — a failed `canMatch` means the lazy bundle for that
    route is never fetched (unlike `canActivate`, which loads the chunk
    first and blocks after).

- **`resolve: { userName: resolveUserName }`** — same shorthand-map pattern
  as `dashboardResolver`/`dashboardResolverTest` (see §6), just with an
  explicit `userName:` key instead of relying on the function's own name.

- **`title: resolveTitle`** — route `title` isn't only a string; it also
  accepts a `ResolveFn<string>`, so the browser tab title can be computed
  from resolved/route data (e.g. `` `${user.firstName}'s Profile` ``)
  instead of a static string like `'Dashboard'`/`'User Profile'` as used
  elsewhere in this repo's routes.

**Q: `canMatch` vs `canActivate` — which would you use to hide an
admin-only route from a regular user entirely (including from route
matching / URL guessing), vs which just blocks entry with a redirect?**
A: `canMatch` for "this route effectively doesn't exist for you" (falls
through to `**`/PageNotFound, doesn't leak that the route exists, skips
lazy-loading the chunk). `canActivate` for "route exists, but you're
redirected/blocked" (e.g. redirect to `/login`) — more common when you want
to tell the user *why* they can't proceed rather than silently 404ing.

**Q: Can multiple guards run on one route (`canMatch: [dummyCanMatch,
anotherGuard]`)?**
A: Yes — array is evaluated in order; if any guard returns `false`/a
`UrlTree`, evaluation short-circuits (like Promise.all-style logical AND
for booleans; a returned `UrlTree` triggers a redirect instead).

## 8. Router API quick reference (used in this feature)

- `Router.navigate(['/user', id], { replaceUrl: true })` — `replaceUrl`
  prevents the user from hitting Back into a stale add-user form.
- `RouterLink` / `RouterLinkWithHref` — `RouterLinkWithHref` is the directive
  Angular actually applies to `<a>` tags; `RouterLink` is what you import in
  most cases (it re-exports/selects the right one). Fine to import just
  `RouterLink` unless asked to explain the split.
- `ActivatedRoute.paramMap` (Observable, reactive) vs
  `ActivatedRoute.snapshot.paramMap` (point-in-time, **not** reactive — won't
  update if only params change while the same component instance is reused).

## 9. Likely follow-up interview questions

1. How would you rewrite `dashboardResolver`-style route-blocking data as a resolver for `UserProfile` instead of `toSignal`? What would you gain/lose?
2. How would you guard `/user/:userId` with `canActivate` if the id doesn't exist, vs `canMatch` if the whole feature is behind a flag?
3. How would you lazy-load this whole feature with `loadChildren`/`loadComponent`, and how does `canMatch` interact with that?
4. Why `input.required<string>()` and not `@Input()`? What happens if the param is missing?
5. What breaks if `withComponentInputBinding()` is removed from `app.config.ts`?
6. Can a resolver's data be bound to a component `input()` instead of `route.snapshot.data[...]`, the way `withComponentInputBinding()` maps route params? (Yes — resolved data is also mapped to matching component inputs when that feature is enabled; `Dashboard` just doesn't use it here.)
7. Why does `runGuardsAndResolvers` default to `'paramsChange'` instead of `'always'`? (Perf — re-running resolvers/guards on every navigation, even unrelated ones, would refire HTTP calls unnecessarily.)
8. What's the difference between `data` and `resolve` when both end up on `route.snapshot.data`?
