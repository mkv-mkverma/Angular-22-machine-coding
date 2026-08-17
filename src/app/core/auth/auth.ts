import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { SKIP_AUTH } from '../interceptors/tokens/skip-interceptor-interceptor';

@Service()
export class Auth {
  //     POST https://dummyjson.com/auth/login
  // Body:  { username: "emilys", password: "emilyspass" }
  // Response: { accessToken, refreshToken, id, username, ... }

  // POST https://dummyjson.com/auth/refresh
  // Body:  { refreshToken }
  // Response: { accessToken, refreshToken }
  private http = inject(HttpClient);

  accessToken = signal('');
  refreshToken = signal('');

  private refreshInProgress$: Observable<{ accessToken: string; refreshToken: string }> | null =
    null;

  login(username: string, password: string) {
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        'https://dummyjson.com/auth/login',
        {
          username,
          password,
        },
        {
          context: new HttpContext().set(SKIP_AUTH, true),
          // withCredentials: true, // NOT enabled here — DummyJSON returns tokens in the JSON
          // body, not a Set-Cookie header, so there's no cookie for the browser to send back.
          // If the backend instead set an HttpOnly refresh-token cookie, this flag is what tells
          // the browser "attach cookies to this cross-origin request, and accept Set-Cookie from
          // the response" — without it, the browser silently drops cross-origin cookies even if
          // the server sends them. The server must also send
          // Access-Control-Allow-Credentials: true (can't pair with Access-Control-Allow-Origin: *).
        },
      )
      .pipe(
        tap((response) => {
          this.setAccessToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);

          // any JS running on the page — including injected XSS payloads.
          // localStorage nor plain in-memory:
          // refresh token in an HttpOnly cookie set by the backend — JS can't read it at all, XSS can't touch it.
          // TODO: Store tokens in HttpOnly cookies instead of localStorage or in memory for better security.
          // localStorage.setItem('accessToken', response.accessToken);
          // localStorage.setItem('refreshToken', response.refreshToken);
        }),
      );
  }

  refresh() {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.http
        .post<{ accessToken: string; refreshToken: string }>(
          `https://dummyjson.com/auth/refresh`,
          { refreshToken: this.refreshToken() },
          { context: new HttpContext().set(SKIP_AUTH, true) },
        )
        .pipe(
          tap((response) => {
            this.setAccessToken(response.accessToken);
            this.setRefreshToken(response.refreshToken);
          }),
          shareReplay(1),
          // finalize is an RxJS operator that runs a callback when the observable completes, errors, or is unsubscribed
          // always runs — success, error, or cancel for cleanup
          finalize(() => (this.refreshInProgress$ = null)),
        );
    }
    return this.refreshInProgress$;
  }

  logout() {
    this.accessToken.set('');
    this.refreshToken.set('');
    // localStorage.removeItem('accessToken');
    // localStorage.removeItem('refreshToken');
  }

  // isAuthenticated
  isLoggedIn() {
    return !!this.accessToken();
  }

  getAccessToken() {
    return this.accessToken();
  }

  getRefreshToken() {
    return this.refreshToken();
  }

  setAccessToken(token: string) {
    this.accessToken.set(token);
  }

  setRefreshToken(token: string) {
    this.refreshToken.set(token);
  }
}
