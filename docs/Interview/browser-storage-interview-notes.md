# Browser Storage: localStorage, sessionStorage & Cookies

## 1. localStorage

- Persistent browser storage.
- Data stays after browser restart until cleared.
- JavaScript can read/write it.
- Best for non-sensitive preferences.

```ts
localStorage.setItem('theme', 'dark');

const theme = localStorage.getItem('theme');

localStorage.removeItem('theme');
```

**Use cases:** theme, language, user preferences, filters.

---

## 2. sessionStorage

- Temporary storage for one browser tab.
- Cleared when the tab/window is closed.
- JavaScript can read/write it.

```ts
sessionStorage.setItem('formStep', '2');

const step = sessionStorage.getItem('formStep');

sessionStorage.removeItem('formStep');
```

**Use cases:** multi-step form progress, temporary tab-specific state.

---

## 3. Cookies

- Small data stored by the browser.
- Browser can automatically send cookies with HTTP requests.
- Commonly used for authentication/session management.
- For sensitive tokens, use `HttpOnly`, `Secure`, and appropriate `SameSite`.

### Real-life authentication

Backend:

```http
Set-Cookie: refreshToken=abc123; HttpOnly; Secure; SameSite=Strict
```

React + Axios:

```ts
axios.post('/auth/refresh', {}, {
  withCredentials: true
});
```

The React code **cannot read** an `HttpOnly` cookie. `withCredentials: true` tells the browser to include credentials/cookies according to cookie and CORS rules.

### Typical flow

```text
Login
  ↓
Backend sets HttpOnly refresh-token cookie
  ↓
Browser stores cookie
  ↓
React calls /auth/refresh
  ↓
withCredentials: true
  ↓
Browser sends cookie automatically
  ↓
Backend validates refresh token
  ↓
New access token returned
```

## Interview Answer

> localStorage is for persistent client-side data, sessionStorage is for temporary tab-specific data, and cookies are mainly used when the browser needs to send data with HTTP requests. In authentication, I use an HttpOnly, Secure, SameSite cookie for the refresh token and `withCredentials: true` in React when calling the refresh API.
