# Angular Routing — canMatch vs canActivate Quick Recall

## Core Difference

```text
canMatch
   ↓
Should Angular USE this route?
   ↓ false
Route is not considered a match
   ↓
Try another matching route


canActivate
   ↓
Route is already selected
   ↓
Can the user ENTER?
   ↓ false
Navigation is cancelled
```

**Interview answer:**

> `canMatch` participates in route matching. If it returns false, Angular treats that route as not matching and can try another route. `canActivate` runs after the route has already been selected, so returning false cancels navigation rather than falling through to another route.

---

## Dashboard — Different Implementation of Same URL

Use `canMatch` when the same URL can use different implementations.

```ts
{
  path: 'dashboard',

  canMatch: [newDashboardGuard],

  loadChildren: () =>
    import('./new-dashboard/new-dashboard.routes')
      .then(m => m.routes)
},

{
  path: 'dashboard',

  loadChildren: () =>
    import('./old-dashboard/old-dashboard.routes')
      .then(m => m.routes)
}
```

Guard:

```ts
export const newDashboardGuard: CanMatchFn = () => {
  const feature = inject(FeatureService);

  return feature.isNewDashboardEnabled();
};
```

### Feature ON

```text
/dashboard
   ↓
newDashboardGuard → true
   ↓
New dashboard route selected
   ↓
New dashboard lazy routes load
```

### Feature OFF

```text
/dashboard
   ↓
newDashboardGuard → false
   ↓
New dashboard route is NOT considered a match
   ↓
Try next /dashboard route
   ↓
Old dashboard lazy routes load
```

**Memory:** `canMatch` is useful for feature flags and choosing between different implementations of the same URL.

---

## Lazy-Loaded Feature

```ts
{
  path: 'admin',

  canMatch: [adminGuard],

  loadChildren: () =>
    import('./admin/admin.routes')
      .then(m => m.routes)
}
```

### `canMatch = true`

```text
/admin
  ↓
canMatch → true
  ↓
Route selected
  ↓
Lazy route loaded
  ↓
Admin feature
```

### `canMatch = false`

```text
/admin
  ↓
canMatch → false
  ↓
This route is not considered a match
  ↓
Try another matching route
```

If no other route matches:

```text
/admin
  ↓
canMatch → false
  ↓
No matching route
  ↓
** route
  ↓
NotFoundComponent
```

**Important:** `canMatch: false` does not automatically mean 404. It means: **Don't use this route; continue route matching.**

---

## `canActivate` — Authentication Example

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.isLoggedIn();
};
```

Route:

```ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard]
}
```

### Logged in

```text
/admin
  ↓
Route matches
  ↓
canActivate → true
  ↓
AdminComponent
```

### Not logged in

```text
/admin
  ↓
Route matches
  ↓
canActivate → false
  ↓
Navigation cancelled
  ↓
AdminComponent does NOT open
```

**Important:** `false` does not throw an error or automatically show an error page. The user normally remains on the current page.

---

## Redirect with `canActivate`

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
```

Flow:

```text
/admin
  ↓
canActivate
  ↓
Not logged in
  ↓
/login
```

Remember:

```text
true      → allow
false     → cancel navigation
UrlTree   → redirect
```

---

## Role-Based Route Availability

The role can come from an API.

Typical flow:

```text
Login
  ↓
Backend / API
  ↓
User + roles
  ↓
AuthService / Store
  ↓
Guard reads current role
  ↓
canMatch
```

Example user data:

```ts
{
  id: 101,
  roles: ['USER']
}
```

Guard:

```ts
export const adminRouteGuard: CanMatchFn = () => {
  const auth = inject(AuthService);

  return auth.hasRole('ADMIN');
};
```

Route:

```ts
{
  path: 'admin',
  component: AdminComponent,
  canMatch: [adminRouteGuard]
}
```

**Important:** frontend guards control navigation/UI. The backend must still enforce authorization.

---

## Not Found Example

Catch-all route:

```ts
{
  path: '**',
  component: NotFoundComponent
}
```

Example:

```text
/admin
  ↓
canMatch → false
  ↓
No other route matches
  ↓
**
  ↓
NotFoundComponent
```

So: `canMatch(false)` can eventually lead to `**`, but only if no other route matches.

---

## Final Comparison

|                                     | `canMatch`                          | `canActivate`                               |
| ----------------------------------- | ----------------------------------- | ------------------------------------------- |
| Question                            | **Should this route match?**        | **Can I enter this route?**                 |
| Runs                                | During route matching               | After route is selected                     |
| `false`                             | Try another route                   | Cancel navigation                           |
| Same URL → different implementation | ⭐ Yes                              | ❌ Not the purpose                          |
| Feature flags                       | ⭐ Yes                              | Possible                                    |
| Lazy-loaded route                   | ⭐ Can prevent selecting/loading it | Route is already selected before activation |
| Authentication                      | Possible                            | ⭐ Common                                   |
| Redirect to login                   | Possible                            | ⭐ Common                                   |

---

## Interview Memory Trick

```text
canMATCH
   ↓
MATCH?
   ↓
false → try another route


canACTIVATE
   ↓
ENTER?
   ↓
false → cancel navigation
```

**One sentence:**

> **canMatch chooses the route; canActivate controls entry into the chosen route.**


# Angular `canDeactivate` — Quick Recall

## Component

```ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  imports: [FormsModule],
  template: `
    <input
      [value]="name()"
      (input)="name.set($any($event.target).value)"
      placeholder="Name"
    />

    <input
      [value]="age()"
      (input)="age.set($any($event.target).value)"
      placeholder="Age"
    />

    <button (click)="submit()">Submit</button>
  `
})
export class UserComponent {

  name = signal('');
  age = signal('');

  isSubmitted = signal(false);

  submit() {
    this.isSubmitted.set(true);
  }
}
```

## Guard

```ts
import { CanDeactivateFn } from '@angular/router';
import { UserComponent } from './user.component';

export const canDeactivateGuard: CanDeactivateFn<UserComponent> =
  (component) => {

    if (component.isSubmitted()) {
      return true;
    }

    if (!component.name() && !component.age()) {
      return true;
    }

    return confirm('You have unsaved changes. Leave this page?');
  };
```

## Route

```ts
{
  path: 'edit-user',
  component: EditUserComponent,
  canDeactivate: [canDeactivateGuard]
}
```

## Flow

```text
User tries to leave /edit-user
          ↓
canDeactivateGuard
          ↓
Submitted?           → true  → Leave
          ↓ false
Form untouched?       → true  → Leave
          ↓ false
confirm('Leave page?') → true  → Leave
                        → false → Navigation cancelled
```

### Remember

> `canDeactivate` = **Can I LEAVE this component?**

The guard receives the current component instance and decides based on its state — submitted, untouched, or dirty (prompt via `confirm()`) — rather than the component deciding for itself. This keeps navigation logic out of the component and makes the guard reusable across components that expose the same shape (`isSubmitted`, form fields).
