# Angular Routing --- Concepts & Interview Recall

> **Goal:** Quick recall, not a textbook. Learn the concept first, then
> remember the small syntax and interview line.

------------------------------------------------------------------------

## 1. Route Definition

Think:

**URL → Component**

``` ts
export const routes: Routes = [
  { path: 'users', component: UsersComponent },
  { path: 'users/:id', component: UserComponent },
  { path: '**', component: NotFoundComponent }
];
```

**Interview:** `path` decides which URL matches; `component` is what
Angular renders.

------------------------------------------------------------------------

## 2. Navigation --- TS vs Template

### TypeScript → `router.navigate()`

``` ts
constructor(private router: Router) {}

goToUser(id: number) {
  this.router.navigate(['/users', id]);
}
```

### Template → `routerLink`

``` html
<a [routerLink]="['/users', id]">View User</a>
```

### Query params

``` ts
this.router.navigate(['/users'], {
  queryParams: { page: 2, sort: 'name' }
});
```

URL:

``` text
/users?page=2&sort=name
```

**Recall:**

``` text
TS       → router.navigate()
Template → routerLink
```

------------------------------------------------------------------------

## 3. `replaceUrl: true` ⭐

``` ts
this.router.navigate(['/users', id], {
  replaceUrl: true
});
```

Normally:

``` text
/add-user → /users/10
```

Back → `/add-user`

With `replaceUrl: true`:

``` text
/users/10
```

The current browser history entry is **replaced**, so Back does not
return to the stale page.

**Interview:**\
\> `replaceUrl` replaces the current history entry instead of adding a
new one.

------------------------------------------------------------------------

## 4. Route Params vs Query Params

Route:

``` ts
{ path: 'users/:id', component: UserComponent }
```

URL:

``` text
/users/10
```

Read:

``` ts
this.route.snapshot.paramMap.get('id');
```

or reactively:

``` ts
this.route.paramMap.subscribe(params => {
  const id = params.get('id');
});
```

Query:

``` text
/users?page=2
```

Read:

``` ts
this.route.queryParamMap.subscribe(params => {
  const page = params.get('page');
});
```

**Recall:**

``` text
/users/:id  → paramMap
?page=2     → queryParamMap
```

### Snapshot vs reactive

``` text
snapshot  → point-in-time value
paramMap  → reacts to parameter changes
```

If the same component instance can stay alive while `id` changes, prefer
the reactive approach.

------------------------------------------------------------------------

## 5. Child Routes

``` ts
{
  path: 'users',
  component: UsersComponent,
  children: [
    {
      path: ':id',
      component: UserProfileComponent
    }
  ]
}
```

Parent template:

``` html
<router-outlet></router-outlet>
```

Think:

``` text
UsersComponent
      ↓
router-outlet
      ↓
UserProfileComponent
```

**Interview:**\
\> Child routes render inside the parent's `router-outlet`.

------------------------------------------------------------------------

## 6. Lazy Loading

### One component

``` ts
{
  path: 'users',
  loadComponent: () =>
    import('./users.component')
      .then(m => m.UsersComponent)
}
```

### Feature route tree

``` ts
{
  path: 'users',
  loadChildren: () =>
    import('./users.routes')
      .then(m => m.routes)
}
```

**Recall:**

``` text
loadComponent → component
loadChildren  → route tree / feature
```

------------------------------------------------------------------------

# 7. Guards ⭐⭐⭐

Think:

> **Guard = Should navigation be allowed?**

The most important distinction:

``` text
canMatch
    ↓
"Should this route match at all?"

canActivate
    ↓
"Route matched — can I enter it?"
```

## `canActivate`

``` ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn();
};
```

``` ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard]
}
```

Flow:

``` text
URL
 ↓
route matched
 ↓
canActivate
 ↓
allowed?
 ↓
component
```

## `canMatch` ⭐⭐⭐

`canMatch` runs while Angular is deciding which route should match.

### Useful example: feature flag

``` ts
export const newDashboardGuard: CanMatchFn = () => {
  const feature = inject(FeatureService);
  return feature.isNewDashboardEnabled();
};
```

``` ts
{
  path: 'dashboard',
  component: NewDashboardComponent,
  canMatch: [newDashboardGuard]
},
{
  path: 'dashboard',
  component: OldDashboardComponent
}
```

If guard returns `true`:

``` text
/dashboard
   ↓
NewDashboardComponent
```

If guard returns `false`:

``` text
/dashboard
   ↓
canMatch = false
   ↓
try next matching route
   ↓
OldDashboardComponent
```

### Why `canMatch` is especially useful for lazy routes

A failed `canMatch` can prevent the lazy route from being
selected/loaded.

### Easy interview memory

> **Match first → Activate second**

  Guard                Remember
  -------------------- ------------------------------
  `canMatch`           Should this route match?
  `canActivate`        Can I enter this route?
  `canActivateChild`   Can I enter its child route?
  `canDeactivate`      Can I leave this route?

**Classic `canDeactivate`:**

``` text
Unsaved form
    ↓
canDeactivate
    ↓
"Are you sure you want to leave?"
```

------------------------------------------------------------------------

# 8. Resolver ⭐⭐⭐

Think:

> **Resolver = required data before navigation completes.**

``` ts
export const userResolver: ResolveFn<User> = (route) => {
  const api = inject(UserService);
  const id = route.paramMap.get('id')!;

  return api.getUser(id);
};
```

Route:

``` ts
{
  path: 'users/:id',
  component: UserComponent,
  resolve: {
    user: userResolver
  }
}
```

Read the result:

``` ts
this.route.snapshot.data['user'];
```

### Mental model

``` text
Navigation
    ↓
Guard
    ↓
Resolver
    ↓
Component
```

### Guard vs Resolver

``` text
Guard     → Can I go?
Resolver  → What data must be ready before I go?
```

**Interview:**\
\> Use a resolver when the page should not activate until important
route data is ready.

------------------------------------------------------------------------

## 9. Resolver + `forkJoin`

Useful when several independent APIs are required before the page
renders:

``` ts
return forkJoin({
  users: api.getUsers(),
  permissions: api.getPermissions(),
  features: api.getFeatures()
});
```

Think:

``` text
API 1 ─┐
API 2 ─┼──→ wait for ALL → navigation continues
API 3 ─┘
```

If one errors, the resolver fails and navigation is cancelled.

**Interview:**\
\> `forkJoin` is useful when the resolver needs multiple independent
calls to complete before activation.

------------------------------------------------------------------------

# 10. Static `data` vs `resolve`

``` ts
{
  path: 'dashboard',
  component: DashboardComponent,

  data: {
    message: 'Hello'
  },

  resolve: {
    user: userResolver
  }
}
```

Remember:

``` text
data    → static route configuration
resolve → dynamically calculated/fetched before navigation
```

Both end up in:

``` ts
this.route.snapshot.data
```

------------------------------------------------------------------------

# 11. Dynamic Route Title ⭐

`title` can be static:

``` ts
{
  path: 'dashboard',
  component: DashboardComponent,
  title: 'Dashboard'
}
```

Or dynamic:

``` ts
{
  path: 'users/:id',
  component: UserComponent,
  title: resolveTitle
}
```

Resolver:

``` ts
export const resolveTitle: ResolveFn<string> = (route) => {
  const id = route.paramMap.get('id')!;
  return `User ${id}`;
};
```

For `/users/10`, browser title becomes:

``` text
User 10
```

**Recall:**

``` text
title: 'Dashboard' → static
title: resolveTitle → dynamic
```

------------------------------------------------------------------------

# 12. `withComponentInputBinding()` ⭐

Configuration:

``` ts
provideRouter(
  routes,
  withComponentInputBinding()
);
```

Route:

``` ts
{
  path: 'users/:userId',
  component: UserComponent
}
```

Component:

``` ts
userId = input.required<string>();
```

Angular can bind:

``` text
:userId
   ↓
component input userId
```

Without `withComponentInputBinding()`, the route parameter does not
automatically populate that input.

**Interview:**\
\> It allows router values such as route params, query params and
resolved data to be bound directly to component inputs.

------------------------------------------------------------------------

# 13. Parent Params in Child Routes

Example:

``` text
/users/10/add
```

`10` belongs to the parent route:

``` ts
path: 'users/:userId'
```

If a deeply nested child needs the parent's params/data, this
configuration can be used:

``` ts
withRouterConfig({
  paramsInheritanceStrategy: 'always'
})
```

**Recall:**

> `always` → child can inherit parent route params/data.

------------------------------------------------------------------------

# 14. Route Param + `switchMap` ⭐

Common pattern:

``` ts
this.route.paramMap.pipe(
  switchMap(params =>
    this.service.getUser(params.get('id')!)
  )
);
```

Why `switchMap`?

``` text
id = 1 → request A
id = 2 → request B
             ↓
        switch to B
```

It avoids showing stale results when the route parameter changes.

**Interview:**\
\> Use `switchMap` when the latest route parameter should cancel/replace
the previous request.

------------------------------------------------------------------------

# 15. `Router` vs `ActivatedRoute`

Very easy:

``` text
Router
  → navigate

ActivatedRoute
  → read current route information
```

Examples:

``` ts
this.router.navigate(['/users']);
```

``` ts
this.route.snapshot.paramMap.get('id');
```

------------------------------------------------------------------------

# 16. `runGuardsAndResolvers`

You usually only need this:

``` ts
{
  runGuardsAndResolvers: 'always'
}
```

Meaning:

> Re-run guards and resolvers on every navigation to that route.

Default behavior is more selective to avoid unnecessary work.

**Interview:**\
\> It controls when guards and resolvers are re-executed for an already
active route.

Don't memorize every option unless specifically asked.

------------------------------------------------------------------------

# 17. Feature Route File

Instead of putting a huge route tree in `app.routes.ts`:

``` ts
{
  path: 'users',
  children: usersManagementRoutes
}
```

Keep feature routes in:

``` text
user-management.route.ts
```

**Interview:**\
\> Feature-owned route files keep routing modular, self-contained and
easier to lazy-load later.

------------------------------------------------------------------------

# 18. Functional Guards / Resolvers

Modern Angular commonly uses function APIs:

``` ts
CanActivateFn
CanMatchFn
CanDeactivateFn
ResolveFn
```

Example:

``` ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn();
};
```

**Recall:**

> Functional guards/resolvers can use `inject()` directly; no class or
> constructor is required.

------------------------------------------------------------------------

# ⭐ Interview Questions --- Only the Valuable Ones

### 1. `router.navigate()` vs `routerLink`?

**Answer:**

> `router.navigate()` is used from TypeScript; `routerLink` is used in
> templates.

------------------------------------------------------------------------

### 2. What does `replaceUrl: true` do?

> It replaces the current browser history entry instead of adding a new
> one.

------------------------------------------------------------------------

### 3. `paramMap` vs `queryParamMap`?

> `paramMap` reads route parameters like `:id`; `queryParamMap` reads
> query parameters like `?page=2`.

------------------------------------------------------------------------

### 4. `snapshot` vs `paramMap` Observable?

> Snapshot is a point-in-time read; the Observable reacts when route
> parameters change.

------------------------------------------------------------------------

### 5. `canMatch` vs `canActivate`? ⭐⭐⭐

> `canMatch` decides whether the route should match at all.
> `canActivate` checks whether an already matched route can be entered.

**Memory:**\
**Match → Activate**

------------------------------------------------------------------------

### 6. When would you use `canDeactivate`?

> To prevent leaving a page, commonly when a form has unsaved changes.

------------------------------------------------------------------------

### 7. What is a resolver? ⭐⭐⭐

> A resolver loads required data before navigation completes, so the
> component receives that data when it activates.

------------------------------------------------------------------------

### 8. Resolver vs API call inside component?

> Resolver blocks navigation until the data is ready. Component fetching
> allows the page to render and show loading state.

------------------------------------------------------------------------

### 9. Why use `forkJoin` in a resolver?

> To run independent requests in parallel and wait until all required
> requests complete.

------------------------------------------------------------------------

### 10. How do you create a dynamic route title?

``` ts
{
  path: 'users/:id',
  component: UserComponent,
  title: resolveTitle
}
```

> `title` can accept a resolver, so the browser title can be generated
> dynamically.

------------------------------------------------------------------------

### 11. Why `withComponentInputBinding()`?

> It lets route values such as `:id` be bound directly to component
> inputs.

------------------------------------------------------------------------

### 12. Why `switchMap` with route params?

> When the route parameter changes, the latest request should replace
> the previous one, preventing stale results.

------------------------------------------------------------------------

# 🧠 30-Second Routing Mental Map

``` text
                    ANGULAR ROUTING
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
       DEFINE          NAVIGATE           READ
       Routes       navigate/routerLink    params
                                          queryParams
          │
          ↓
       PROTECT
          │
    ┌─────┴─────┐
    ↓           ↓
canMatch   canActivate
"match?"   "enter?"
    │
    ↓
  RESOLVE
"data ready?"
    │
    ↓
 COMPONENT
    │
    ↓
router-outlet
```

## Final memory formula

``` text
Router        → MOVE
ActivatedRoute → READ
canMatch      → MATCH?
canActivate   → ENTER?
canDeactivate → LEAVE?
Resolver      → DATA READY?
router-outlet → RENDER CHILD
lazy loading  → LOAD LATER
replaceUrl    → REPLACE HISTORY
title resolver→ DYNAMIC TAB TITLE
```

**This is the level I would revise before an Angular interview.** Don't
try to memorize every Router API. If these concepts are automatic, you
can explain most follow-up questions and then expand only when the
interviewer asks.

Source basis: your uploaded routing/user-management interview material.
fileciteturn1file0
