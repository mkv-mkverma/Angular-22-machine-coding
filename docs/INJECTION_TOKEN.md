# Angular `InjectionToken`: API URL example

In this application, the polling component needs the API base URL.

```ts
private apiUrl = inject(API_URL);
```

`API_URL` is an **InjectionToken**. It is a unique key that tells Angular:

> “Give this class the value registered for `API_URL`.”

## The three connected parts

### 1. Create the token

`src/app/components/core/tokens/api-url.token.ts`

```ts
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
```

`string` means this token must resolve to a string value.

### 2. Provide its value once

`src/app/app.config.ts`

```ts
{ provide: API_URL, useValue: 'https://jsonplaceholder.typicode.com' }
```

This registers the mapping:

```ts
API_URL -> 'https://jsonplaceholder.typicode.com'
```

### 3. Inject and use it

`src/app/components/short-polling/short-polling.ts`

```ts
private apiUrl = inject(API_URL);

getUsers() {
  return this.http.get<User[]>(`${this.apiUrl}/users`);
}
```

Angular looks up `API_URL` and assigns its provided string to `apiUrl`.

## Why not a normal constant file?

For a small app with one fixed URL, a constant is completely fine:

```ts
export const API_URL = 'https://jsonplaceholder.typicode.com';
```

You would import that constant directly. It is simpler, but its value is fixed in the source code.

An `InjectionToken` is useful when the value may differ by environment, test, or application setup. The component does not know the URL; Angular supplies it.

| Normal constant | `InjectionToken` |
| --- | --- |
| Imported directly by the component | Requested from Angular with `inject()` |
| Fixed when the code is built | Configured by a provider |
| Simple for a fixed value | Easy to replace for tests or environments |

For example, a test can provide a fake API URL without changing the component:

```ts
{ provide: API_URL, useValue: 'http://localhost:3000' }
```

## Simple rule

- Use a **constant** when the value will always be the same and does not need Angular configuration.
- Use an **InjectionToken** when you want Angular to supply or replace the value.

Your current API URL setup is a good `InjectionToken` learning example because it keeps the component independent of the actual API address.
