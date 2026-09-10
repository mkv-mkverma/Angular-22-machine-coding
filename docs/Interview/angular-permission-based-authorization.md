# Angular Permission-Based Authorization (RBAC)

> **Goal:** Understand how permissions from the backend are used in Angular to control **routes** and **UI elements**.

---

## 1. Big Picture

```text
                         BACKEND
                            │
                            │ User permissions
                            ↓
                  Angular Application
                            │
                            ↓
              AuthorizationService
                            │
                     Set<string>
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ↓                             ↓
       Permission Guard             Permission Directive
             │                             │
       canMatch /                     *appHasPermission
       canActivate                         │
             │                             │
             ↓                             ↓
        Route access                  Button visibility
```

### Important rule

Angular authorization is mainly for **navigation and UI experience**.

The **backend must always perform the final authorization check** for protected APIs.

```text
Angular says:  "Show Delete button"
Backend says:  "Can this user actually delete?"
```

---

# 2. Login → Permissions

The backend can return the access token and authorization information together.

```http
POST /auth/login
```

Example response:

```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "u123",
    "name": "John",
    "tenantId": "tenant-abc"
  },
  "roles": [
    "ADMIN"
  ],
  "permissions": [
    "orders:read",
    "orders:create",
    "orders:update",
    "orders:delete"
  ]
}
```

Angular stores the permissions in memory.

```text
LOGIN
  │
  │ username/password
  ↓
BACKEND
  │
  ├── Access Token ─────→ Angular memory
  │
  └── Permissions ──────→ AuthorizationService
```

Another common enterprise design is:

```text
POST /auth/login
       ↓
Access Token

GET /auth/me
       ↓
User + Roles + Permissions
```

Both designs are valid.

---

# 3. AuthorizationService

Keep permissions in one central service.

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private permissions =
    signal<Set<string>>(new Set());

  setPermissions(permissions: string[]) {
    this.permissions.set(
      new Set(permissions)
    );
  }

  hasPermission(permission: string): boolean {
    return this.permissions().has(permission);
  }

  clearPermissions() {
    this.permissions.set(new Set());
  }
}
```

### Why `Set`?

Because authorization is mostly a membership check:

```typescript
hasPermission('orders:delete')
```

A `Set` is a clean structure for this.

---

# 4. Permission Data

Suppose the backend returns:

```json
{
  "permissions": [
    "orders:read",
    "orders:update"
  ]
}
```

Angular stores:

```text
AuthorizationService
        │
        ↓
permissions = Set
        │
        ├── orders:read
        └── orders:update
```

Now:

```typescript
authorizationService.hasPermission(
  'orders:delete'
);
```

returns:

```text
false
```

because the user does not have `orders:delete`.

---

# 5. UI Authorization — Delete Button

We want:

```text
orders:delete
      ↓
   permission
      ↓
Show Delete button
```

## Simple approach: `*ngIf`

This is perfectly valid:

```html
<button
  *ngIf="authorizationService.hasPermission('orders:delete')"
  (click)="deleteOrder(order.id)">
  Delete
</button>
```

For a small application, this may be enough.

---

# 6. Enterprise Approach — Reusable Permission Directive

In a large application, permissions may be checked in many places:

```text
Orders
Users
Invoices
Payments
Reports
Products
Admin
```

Instead of repeating authorization logic everywhere, create a reusable directive.

```typescript
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  private templateRef =
    inject(TemplateRef<any>);

  private viewContainer =
    inject(ViewContainerRef);

  private authorizationService =
    inject(AuthorizationService);

  @Input()
  set appHasPermission(permission: string) {

    this.viewContainer.clear();

    if (
      this.authorizationService
        .hasPermission(permission)
    ) {
      this.viewContainer.createEmbeddedView(
        this.templateRef
      );
    }
  }
}
```

Now the template becomes very clean:

```html
<button
  *appHasPermission="'orders:delete'"
  (click)="deleteOrder(order.id)">
  Delete
</button>
```

---

# 7. How the Permission Directive Works

```text
HTML

<button
  *appHasPermission="'orders:delete'">

              │
              ↓

HasPermissionDirective

              │
              ↓

AuthorizationService

              │
              ↓

hasPermission('orders:delete')

              │
        ┌─────┴─────┐
        ↓           ↓
       YES          NO
        ↓           ↓
      Render      Don't render
      button        button
```

So if backend gives:

```json
{
  "permissions": [
    "orders:read",
    "orders:update"
  ]
}
```

then:

```html
<button *appHasPermission="'orders:delete'">
```

will not be rendered.

---

# 8. Route Authorization

Suppose `/admin` requires:

```text
admin:access
```

Route:

```typescript
{
  path: 'admin',

  canMatch: [permissionGuard],

  loadChildren: () =>
    import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),

  data: {
    permission: 'admin:access'
  }
}
```

The permission is kept in route metadata:

```typescript
data: {
  permission: 'admin:access'
}
```

This makes the guard reusable.

---

# 9. Permission Guard

```typescript
export const permissionGuard: CanMatchFn = (
  route
) => {

  const authorizationService =
    inject(AuthorizationService);

  const router = inject(Router);

  const permission =
    route.data?.['permission'];

  if (
    authorizationService
      .hasPermission(permission)
  ) {
    return true;
  }

  return router.createUrlTree([
    '/forbidden'
  ]);
};
```

---

# 10. Route Flow

```text
USER
  │
  │ /admin
  ↓
Angular Router
  │
  ↓
canMatch
  │
  ↓
Permission Guard
  │
  ↓
hasPermission('admin:access')
  │
  ├───────────────┐
  ↓               ↓
 YES              NO
  │               │
  ↓               ↓
Load Admin      /forbidden
Route
```

With `canMatch`, the route is only matched when the user has the required permission.

This is especially useful with lazy-loaded features because unauthorized users don't need to match/load that route.

---

# 11. `canMatch` vs `canActivate`

### `canMatch`

Think:

> "Should this route match for this user?"

Useful for:

```text
Lazy-loaded modules
Feature access
Permission-based route matching
```

Example:

```typescript
{
  path: 'admin',
  canMatch: [permissionGuard],
  loadChildren: () =>
    import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
}
```

### `canActivate`

Think:

> "The route matched. Is the user allowed to activate/enter it?"

Example:

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [permissionGuard]
}
```

For lazy-loaded enterprise features, `canMatch` is often a good fit.

---

# 12. Complete Authorization Flow

```text
                         LOGIN
                           │
                           │ username/password
                           ↓
                       BACKEND
                           │
                  ┌────────┴─────────┐
                  │                  │
                  ↓                  ↓
             Access Token       Permissions
                  │                  │
                  ↓                  ↓
             Angular Memory      Angular Memory
                                     │
                                     ↓
                         AuthorizationService
                                     │
                              Set<string>
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ↓                                       ↓
           ROUTE ACCESS                              UI ACCESS
                 │                                       │
                 ↓                                       ↓
         canMatch / canActivate                 appHasPermission
                 │                                       │
                 ↓                                       ↓
        "admin:access"                         "orders:delete"
                 │                                       │
                 ↓                                       ↓
        Can enter /admin?                       Show Delete?
                 │                                       │
             ┌───┴───┐                               ┌───┴───┐
             ↓       ↓                               ↓       ↓
            YES      NO                             YES      NO
             ↓       ↓                               ↓       ↓
          Route    /forbidden                     SHOW     HIDE
```

---

# 13. Most Important: Backend Is the Final Authority

Suppose the user does **not** have:

```text
orders:delete
```

Angular hides:

```text
Delete button
```

But a malicious user can bypass Angular and manually send:

```http
DELETE /api/orders/123
Authorization: Bearer <access-token>
```

The backend must still check:

```text
JWT
 ↓
Identify user
 ↓
Get user's effective permissions
 ↓
Check orders:delete
 ↓
 ┌──────────────┐
 │              │
 YES            NO
 │              │
 ↓              ↓
204            403
```

Therefore:

```text
Angular permission check
        ↓
UI / navigation
```

but:

```text
Backend authorization check
        ↓
REAL SECURITY
```

---

# 14. Permission-Based Design vs Role-Based UI

Avoid putting role logic everywhere:

```typescript
if (user.role === 'ADMIN') {
  // show delete
}
```

Prefer:

```typescript
authorizationService.hasPermission(
  'orders:delete'
);
```

Why?

Backend can map roles to permissions:

```text
ADMIN
  │
  ├── orders:read
  ├── orders:create
  ├── orders:update
  └── orders:delete

ORDER_MANAGER
  │
  ├── orders:read
  ├── orders:create
  ├── orders:update
  └── orders:delete

VIEWER
  │
  └── orders:read
```

Angular doesn't need to know this mapping.

It only asks:

```text
"Does this user have orders:delete?"
```

This makes the frontend more flexible.

---

# 15. Recommended Enterprise Structure

A clean Angular structure can look like:

```text
src/app/
│
├── auth/
│   └── auth.service.ts
│
├── authorization/
│   ├── authorization.service.ts
│   ├── permission.guard.ts
│   └── has-permission.directive.ts
│
├── orders/
│   ├── orders.component.ts
│   └── orders.routes.ts
│
└── admin/
    └── admin.routes.ts
```

Responsibilities:

```text
AuthService
    ↓
Login / logout / session

AuthorizationService
    ↓
Permissions

PermissionGuard
    ↓
Route access

HasPermissionDirective
    ↓
UI visibility
```

---

# 16. Interview Mental Model

Remember this:

```text
                    BACKEND
                       │
                       │ effective permissions
                       ↓
             AuthorizationService
                       │
                  Set<string>
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
           ROUTES                UI
             ↓                   ↓
       canMatch /           Permission
       canActivate           Directive
             │                   │
             ↓                   ↓
        allow/deny          show/hide

             BUT
              ↓
           BACKEND
              ↓
      final authorization
              ↓
        200/204 or 403
```

### One-line interview answer

> **"We get the user's effective permissions from the backend, store them in an in-memory AuthorizationService, use a reusable permission directive for UI visibility and `canMatch`/`canActivate` for route authorization. These client-side checks improve UX and navigation, but the backend remains the final security boundary and validates permissions for every protected operation."**

---

# 17. The Three Questions to Keep Separate

```text
AUTHENTICATION
"Who are you?"
        ↓
Access Token / Session
```

```text
ROUTE AUTHORIZATION
"Can you enter /admin?"
        ↓
canMatch / canActivate
```

```text
OPERATION AUTHORIZATION
"Can you delete order 123?"
        ↓
orders:delete
        ↓
Backend MUST enforce
```

If you understand these three separately, the whole authorization architecture becomes much easier.
