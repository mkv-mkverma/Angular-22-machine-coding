# Angular 22 HTTP Interceptor — Interview-Focused Real-World Project

I am preparing for Angular Lead/Senior Engineer interviews in 2026.

I want to learn Angular HTTP Interceptors from an **interview point of view**, not by studying every possible interceptor feature.

Create a single small but realistic **Angular 22 interview project** that demonstrates the most commonly asked and must-know interceptor concepts.

Use a real/mock API such as DummyJSON where appropriate:

- https://dummyjson.com/auth/login
- https://dummyjson.com/auth/refresh
- https://dummyjson.com/users

If DummyJSON cannot reproduce a production scenario exactly, explain the limitation and simulate/mock that part locally rather than teaching an unrealistic implementation.

## Goal

I should be able to confidently answer interview questions such as:

1. What is an HTTP interceptor?
2. Why do we use interceptors?
3. What is the difference between functional and class-based interceptors?
4. How do you register an interceptor in Angular 22?
5. How do you add a Bearer token to every API request?
6. How do you handle 401 Unauthorized globally?
7. What happens when an access token expires?
8. How does refresh-token flow work?
9. How do you retry the original request after refreshing the token?
10. How do you prevent multiple refresh-token API calls when several requests fail with 401 simultaneously?
11. What happens if the refresh token itself expires?
12. How do you logout automatically?
13. How do you handle API errors globally?
14. How do you implement retry for temporary HTTP failures?
15. Which errors should NOT be retried?
16. How do you avoid retrying POST requests incorrectly?
17. How do you use `withCredentials`?
18. What is the difference between Bearer-token authentication and HttpOnly-cookie authentication?
19. How do you handle errors from the interceptor itself?
20. How do you skip an interceptor for a particular request?
21. How do you prevent an interceptor from intercepting the refresh-token request?
22. How do multiple interceptors execute?
23. What is the order of interceptor execution?
24. How would you implement logging?
25. How would you implement global error handling?
26. Where should authentication logic live — component, service, interceptor, or guard?
27. What should happen when the user clicks Logout?
28. How would you design this for a production application?

---

# Project Requirements

Build ONE Angular 22 project.

Do NOT create separate Angular projects for each interceptor.

Start simple and progressively add functionality.

## Phase 1 — Basic HTTP setup

Create:

```text
Angular 22
├── core/
├── features/
│   ├── login/
│   └── users/
```

Explain exactly:

- Which command creates the project
- Which folders to create
- Which files to create
- What code goes into each file
- Why each file belongs in that location

---

# Phase 2 — Login

Implement a login screen.

Use DummyJSON login if suitable.

Example:

```text
POST /auth/login
```

Explain:

- request body
- response
- access token
- refresh token
- where tokens are stored for this interview project
- security limitations of localStorage
- what a production application would preferably use

Create an `AuthService`.

Implement:

```text
login()
logout()
isAuthenticated()
getAccessToken()
refreshToken()
```

---

# Phase 3 — Auth Interceptor

Create:

```text
core/interceptors/auth.interceptor.ts
```

Use the modern Angular 22 functional interceptor approach:

```typescript
HttpInterceptorFn;
```

Implement:

```text
Authorization: Bearer <access-token>
```

for protected API requests.

Explain:

- `HttpRequest`
- `req.clone()`
- `HttpHandlerFn`
- `next(req)`
- immutable HTTP requests
- why we clone requests
- why we should not manually modify the original request

Register it using the Angular 22 provider approach:

```typescript
provideHttpClient(
  withInterceptors([
    ...
  ])
)
```

Explain exactly where registration happens and why.

---

# Phase 4 — Refresh Token Flow

Implement the most important interview scenario:

```text
User calls API
      ↓
Access token expired
      ↓
API returns 401
      ↓
Interceptor detects 401
      ↓
Call refresh-token API
      ↓
Receive new access token
      ↓
Save new token
      ↓
Retry original request
      ↓
Return response to component
```

Explain every step.

Show the RxJS operators used and explain why they are used.

---

# Phase 5 — Multiple 401 Requests

This is very important for a Lead/Senior interview.

Simulate this situation:

```text
Request A → 401
Request B → 401
Request C → 401
```

Do NOT make three refresh-token requests.

Implement a mechanism so that:

```text
A ─┐
B ─┼──→ one refresh request
C ─┘
```

After the refresh succeeds:

```text
A → retry
B → retry
C → retry
```

Explain the concurrency problem clearly.

Explain concepts such as:

- refresh-in-progress state
- queueing pending requests
- `BehaviorSubject`
- `filter`
- `take`
- `switchMap`
- `catchError`
- why the refresh request must not recursively trigger the same refresh logic

This is one of the most important parts of the project.

---

# Phase 6 — Refresh Failure

Handle:

```text
API → 401
      ↓
Refresh token
      ↓
Refresh fails / 401
      ↓
Clear authentication
      ↓
Logout
      ↓
Redirect to login
```

Explain why repeatedly refreshing the token is dangerous.

Prevent an infinite loop such as:

```text
401
→ refresh
→ 401
→ refresh
→ 401
→ refresh
...
```

---

# Phase 7 — Global Error Handling

Create a global HTTP error interceptor.

Handle:

```text
400
401
403
404
409
429
500
502
503
504
```

Do NOT simply show the same message for every error.

Create a clear strategy.

For example:

```text
400 → Invalid request
401 → Authentication handling
403 → Access denied
404 → Resource not found
429 → Too many requests
500+ → Server problem
```

Explain whether authentication errors should be handled by the Auth Interceptor or Error Interceptor.

Explain interceptor responsibility boundaries.

---

# Phase 8 — Retry Interceptor

Create:

```text
retry.interceptor.ts
```

Implement retry for temporary failures.

For example:

```text
503
→ wait
→ retry
→ wait
→ retry
→ final error
```

Use RxJS.

Explain:

- `retry`
- `retryWhen` if appropriate
- exponential backoff
- maximum retry count
- which HTTP methods are safe to retry
- why blindly retrying POST requests can be dangerous
- which errors should not be retried
- how retry interacts with 401 handling

Use a simple interview-friendly implementation first.

Then show how you would improve it for production.

---

# Phase 9 — withCredentials

Explain and demonstrate:

```typescript
withCredentials: true;
```

Explain:

- cookies
- HttpOnly cookies
- Secure cookies
- SameSite
- CORS
- credentials
- why JavaScript cannot read HttpOnly cookies
- why cookie-based authentication can be safer against token theft from JavaScript
- why `withCredentials` is required for cross-origin cookie requests

Show a practical example.

Clearly distinguish:

```text
Authorization: Bearer token
```

from:

```text
HttpOnly cookie
```

---

# Phase 10 — HttpContext

Show how to skip an interceptor for a particular request.

For example:

```text
login request
refresh-token request
public API
```

should not receive a Bearer token.

Demonstrate Angular's `HttpContext` / `HttpContextToken`.

Create something like:

```text
SKIP_AUTH
```

and explain why this is useful.

---

# Phase 11 — Logging Interceptor

Create:

```text
logging.interceptor.ts
```

Log:

```text
HTTP method
URL
status
duration
```

Example:

```text
GET /users
200
143ms
```

Explain how you would disable verbose logging in production.

---

# Phase 12 — Logout

Implement:

```text
logout()
```

It should:

```text
clear authentication
clear stored tokens
reset user state
redirect to login
```

Explain whether logout should also call a backend logout endpoint.

Explain the difference between:

```text
client-side logout
```

and:

```text
server-side session/token invalidation
```

---

# Phase 13 — Final Folder Structure

End with a clean production-style structure such as:

```text
src/app/
│
├── core/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.model.ts
│   │   └── auth.store.ts
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   ├── retry.interceptor.ts
│   │   └── logging.interceptor.ts
│   │
│   └── services/
│       └── global-error.service.ts
│
├── features/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   │
│   └── users/
│       ├── users.component.ts
│       └── users.service.ts
│
├── app.config.ts
└── app.routes.ts
```

Explain why each folder exists.

---

# Phase 14 — Interview Questions

After completing the project, ask me interview questions one by one.

Start with easy questions and gradually increase difficulty.

Include scenario-based Lead Engineer questions such as:

### Scenario 1

```text
Five API calls happen simultaneously.
All five return 401.

What will your interceptor do?
```

### Scenario 2

```text
Refresh token API also returns 401.

What happens?
```

### Scenario 3

```text
Your retry interceptor retries a POST request three times.

Why could this be dangerous?
```

### Scenario 4

```text
The API is returning 500 for 30 seconds.

Should you keep retrying?
```

### Scenario 5

```text
Login request is getting the Authorization header.

How would you prevent that?
```

### Scenario 6

```text
The user opens the application in multiple browser tabs.
The access token expires.

How would you handle authentication consistently?
```

### Scenario 7

```text
Your interceptor causes an infinite refresh loop.

How would you debug it?
```

### Scenario 8

```text
How would you design authentication using HttpOnly cookies instead of localStorage?
```

---

# Important Teaching Rules

Teach me this specifically for a **2026 Angular Lead/Senior interview**.

Do NOT overwhelm me with every obscure Angular interceptor feature.

Mark topics as:

```text
⭐⭐⭐ MUST KNOW
⭐⭐ SHOULD KNOW
⭐ NICE TO KNOW
```

For every important concept provide:

1. Simple explanation
2. Real-world example
3. Code
4. Why the code works
5. Common mistake
6. Interview answer
7. Follow-up interview question

Prefer modern Angular 22 APIs and patterns.

Use standalone Angular architecture.

Prefer functional interceptors unless there is an interview reason to explain class-based interceptors.

At the end give me a compact:

```text
Angular Interceptor Interview Cheat Sheet
```

that I can revise before an interview.

The final goal is that I can confidently explain and implement:

```text
Auth
→ Bearer token
→ 401
→ Refresh token
→ Concurrent requests
→ Retry original request
→ Refresh failure
→ Logout
→ Global error handling
→ Retry transient errors
→ withCredentials
→ HttpContext
→ Logging
→ Interceptor registration
```

without blindly memorizing code.
