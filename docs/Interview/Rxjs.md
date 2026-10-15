# RxJS Interview Notes

```
  // Constructor or field initializer
  // takeUntilDestroyed()

  // Lifecycle hook, event handler, or ordinary method
  // takeUntilDestroyed(this.destroyRef)

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe((value) => console.log(value));
  }

  ngOnInit() {
    interval(1000)
      .pipe(takeUntilDestroyed()) // ❌ Outside injection context
      .subscribe((value) => console.log(value));
  }

  onButtonClick() {
    interval(1000)
      .pipe(takeUntilDestroyed()) // ❌ Outside injection context
      .subscribe(console.log);
  }

  timer = interval(1000)
    .pipe(takeUntilDestroyed())
    .subscribe((value) => console.log(value));

  //   runInInjectionContext
  someMethod() {
    runInInjectionContext(this.injector, () => {
      interval(1000).pipe(takeUntilDestroyed()).subscribe(console.log);
    });
  }
```

```
 // timer(initialDelay) emits 0 after 2s and complete
  time = timer(2000).subscribe((value) => {
    console.log('timer',value);
  });

  // timer(initialDelay, repeatInterval)
  time2 = timer(0,1000).subscribe((value) => {
    console.log('timer2',value);
  });

  // interval(period)
  interval = interval(1000).subscribe((value) => {
    console.log('interval',value);
  });
```

```
 Both return an Observable.

 of() → emits the values passed to it.

 from() → converts an iterable, Promise,
          or Observable-like input into an Observable
          and emits its values.
```

## Flattening Operators

### `exhaustMap`

Ignores new source emissions while the current inner observable is running. Once the current observable completes, it can accept the next emission.

**Example use case:** login or submit actions (prevents duplicate submissions).

### `switchMap`

Unsubscribes from the previous inner observable and starts the new one as soon as a new value arrives.

### `concatMap`

Waits for the current inner observable to complete before subscribing to the next one. Order is maintained.

### `mergeMap`

Subscribes to inner observables concurrently, so multiple operations can run at the same time. Results are emitted as they complete, so output order is not guaranteed.

### `forkJoin`

Runs multiple Observables in parallel and emits their final values only after all of them complete.

## Take Operators

### `take(n)`

Takes the first `n` emissions from an Observable and then completes the subscription.

### `takeLast(n)`

Waits for the source Observable to complete and then emits its last `n` values.

## Core Concepts

### Observable

A stream of values that can emit multiple values over time. We subscribe to receive those values, use RxJS operators to transform/process them. It is **lazy** — it doesn't start producing values until there is a subscription.

### Subject

Both an Observable and an Observer. We can subscribe to it to receive values and call `next()` to emit values. A Subject is **hot** and shares emissions among its subscribers, whereas a normal **cold** Observable generally creates a separate execution for each subscription.

### BehaviorSubject

A hot Observable that is both an Observable and an Observer. It requires an initial value and stores the latest value. When a new subscriber subscribes, it immediately receives the current/latest value.

## `shareReplay`

`shareReplay(1)` shares the source execution among multiple subscribers and replays the latest emitted value to new subscribers. It's commonly used to share or cache HTTP responses.

```ts
users$ = this.http.get<User[]>('/api/users').pipe(
  shareReplay({
    bufferSize: 1,
    refCount: true,
  }),
);
```

- `shareReplay(1)` shares a single HTTP request among multiple subscribers and replays the latest response to new subscribers.
- `refCount: true` automatically unsubscribes from the source when the last subscriber unsubscribes, which helps avoid keeping long-lived sources active unnecessarily.

**Summary:**

- `shareReplay(1)` = cache the latest value.
- `refCount: true` = automatically unsubscribe from the source when nobody is listening.

## App-Level Caching (Map-based)

```ts
private cache = new Map<string, User[]>();

getUsers(type: string) {
  if (this.cache.has(type)) {
    return of(this.cache.get(type)!);
  }

  return this.http.get<User[]>(`/api/users?type=${type}`).pipe(
    tap(users => this.cache.set(type, users))
  );
}
```

## Error Handling

For Angular HTTP errors, I can use `catchError` inside the RxJS pipeline to handle or transform the error. I can log the error, return a fallback Observable, or rethrow the error if the caller should handle it. An error that isn't handled can reach the subscriber's error callback.

## 1. Subject

A basic multicast Observable.

```ts
const subject = new Subject<number>();

subject.subscribe((x) => console.log('A:', x));

subject.next(1);
subject.next(2);

subject.subscribe((x) => console.log('B:', x));

subject.next(3);
```

### Output

```text
A: 1
A: 2
A: 3
B: 3
```

### Key point

A new subscriber only receives **future emissions**.

### Remember

> **Subject = Future values only**

---

## 2. BehaviorSubject ⭐

Stores the **latest value** and requires an **initial value**.

```ts
const subject = new BehaviorSubject<number>(0);

subject.subscribe((x) => console.log('A:', x));

subject.next(1);
subject.next(2);

subject.subscribe((x) => console.log('B:', x));
```

### Output

```text
A: 0
A: 1
A: 2
B: 2
```

### Key point

A new subscriber immediately receives the **latest/current value**.

### Remember

> **BehaviorSubject = Current/latest value**

### Angular use case

Very common for sharing application state between components/services.

Example:

```ts
private userSubject = new BehaviorSubject<User | null>(null);

user$ = this.userSubject.asObservable();
```

---

## 3. ReplaySubject

Stores and replays **multiple previous values**.

```ts
const subject = new ReplaySubject<number>(2);

subject.next(1);
subject.next(2);
subject.next(3);

subject.subscribe((x) => console.log(x));
```

### Output

```text
2
3
```

Because we configured:

```ts
new ReplaySubject(2);
```

it replays the **last 2 values** to a new subscriber.

### Time-based replay

You can also configure a time window:

```ts
new ReplaySubject<number>(2, 5000);
```

This means it can replay up to **2 values from the last 5 seconds**.

### Remember

> **ReplaySubject = Replay history**

---

## 4. AsyncSubject

Only emits the **last value**, and only when the Subject completes.

```ts
const subject = new AsyncSubject<number>();

subject.subscribe((x) => console.log(x));

subject.next(1);
subject.next(2);
subject.next(3);

subject.complete();
```

### Output

```text
3
```

### Key point

Values `1` and `2` are not emitted to the subscriber. Only the final value `3` is emitted when `complete()` is called.

### Remember

> **AsyncSubject = Final value after complete**

---

# Subject vs Observable

This is another common interview question.

### Observable

```
1. Observable = produces data.
2. Observer = listening to that data.
3. Subscription = connecting the Observer to the Observable.


- different source of execution
Cold: HttpClient.get(), of(), from(), interval() (each subscription creates its own timer).

- same source of execution
Hot: Subject, DOM click events shared through one event source.
```

An Observable generally represents a stream that subscribers consume.

```ts
const observable$ = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
});
```

### Subject

A Subject can be both:

- **Observable** → other code can subscribe to it
- **Observer** → you can push values into it using `next()`

```ts
const subject = new Subject<number>();

subject.subscribe((value) => console.log(value));

subject.next(10);
subject.next(20);
```

Output:

```text
10
20
```

### Remember

> **Observable = produces values**
>
> **Subject = can receive and broadcast values**

---

# Most Important for Angular

If the interviewer asks:

### "Which Subject do you commonly use in Angular?"

A strong answer:

> **BehaviorSubject** is commonly used when we need to maintain and share the current state/value with multiple subscribers. New subscribers immediately receive the latest value.

Example:

```ts
private countSubject = new BehaviorSubject<number>(0);

count$ = this.countSubject.asObservable();

increment() {
  this.countSubject.next(this.countSubject.value + 1);
}
```

---

# Interview One-Liner

| Subject           | Easy way to remember       |
| ----------------- | -------------------------- |
| `Subject`         | Future values              |
| `BehaviorSubject` | Latest value               |
| `ReplaySubject`   | Previous N values          |
| `AsyncSubject`    | Final value after complete |

# RxJS Interview Notes: `forkJoin`, `mergeMap`, `concatMap`, `switchMap`, and `exhaustMap`

A practical guide to how these RxJS operators behave, when to use them,
and how to explain them in Angular interviews.

## 1. Quick comparison

---

Behavior `forkJoin` `mergeMap` `concatMap` `switchMap` `exhaustMap`

---

Main purpose Wait for all Run inner Run inner Keep the latest Ignore new
results observables observables inner observable inputs while
concurrently sequentially busy

Concurrency Subscribes to Concurrent by One inner One active inner One active
supplied default observable at subscription at inner
observables a time a time subscription
concurrently at a time

Output One combined Each inner Each result in Results from the Results from
result result as it sequence latest active the accepted
arrives inner observable inner
observable

What happens Not a mapping Starts another Queues the Unsubscribes Ignores the
to new input? operator; inner input from the input while
works with observable, previous inner busy
supplied subject to observable  
observables concurrency  
limit

Typical use Load Fetch many Ordered saves Search Prevent
independent independent or sequential autocomplete and duplicate
dashboard data records operations latest-filter submit/login
requests triggers

Important Needs all Unhandled A slow request Unsubscription Inputs
caveat inputs to inner error delays later does not arriving while
complete; an can error the queued guarantee busy are
input that overall stream requests server-side work discarded, not
never was undone queued
completes  
prevents  
output
------------------------------------------------------------------------------------------

## 2. `forkJoin`: wait for all, then emit once

Use `forkJoin` when several finite observables can run independently and
you need their final values together.

```typescript
import { forkJoin } from 'rxjs';

forkJoin({
  users: this.http.get('/api/users'),
  products: this.http.get('/api/products'),
  orders: this.http.get('/api/orders'),
}).subscribe({
  next: (result) => {
    console.log(result.users);
    console.log(result.products);
    console.log(result.orders);
  },
  error: (error) => console.error(error),
});
```

Suppose users takes 1 second, orders takes 2 seconds, and products takes
5 seconds:

- No combined result is emitted after 1 or 2 seconds.
- Once all three complete, `forkJoin` emits one object containing
  their final values.
- If an input errors, `forkJoin` errors unless the error is handled
  inside that input.
- If an input completes without emitting any value, `forkJoin`
  completes without producing a combined value.
- If an input never completes, `forkJoin` never emits.

**Remember:** `forkJoin` = wait for all, then emit the combined final
values once.

## 3. `mergeMap`: run concurrently

Use `mergeMap` when multiple inner operations can run at the same time
and their results can be handled independently.

```typescript
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

from([1, 2, 3])
  .pipe(mergeMap((id) => this.http.get(`/api/users/${id}`)))
  .subscribe({
    next: (user) => console.log(user),
    error: (error) => console.error(error),
  });
```

- Requests can overlap; the next request does not wait for the
  previous one.
- Results are emitted as the individual requests complete, so output
  order may differ from input order.
- By default, `mergeMap` has unlimited concurrency.
- A concurrency limit can be supplied: `mergeMap(project, 3)` allows
  at most three active inner subscriptions; extra source values wait.
- If an inner observable errors and the error is not handled, the
  overall stream errors and active inner subscriptions are
  unsubscribed.

### Example: 10 requests, 5 slow

If all 10 IDs are emitted and concurrency is 10, all 10 requests can
start without waiting for one another. If five return quickly and five
take longer, the quick results arrive first while the slow requests
continue.

```typescript
from(Array.from({ length: 10 }, (_, index) => index + 1))
  .pipe(
    mergeMap((id) => {
      const delaySeconds = id <= 5 ? 1 : 5;

      return this.http.get(`https://httpbin.org/delay/${delaySeconds}?id=${id}`);
    }, 10),
  )
  .subscribe({
    next: (result) => console.log('Result:', result),
    error: (error) => console.error('Request failed:', error),
  });
```

This uses HTTPBin's public delay endpoint for demonstration. Public
services can be unavailable or rate-limited, so it is best for
experiments rather than production. In a real Angular app, configure
`HttpClient` using `provideHttpClient()` or the setup appropriate to
your Angular version.

**Remember:** `mergeMap` = concurrent work; emit each result as it
arrives.

## 4. `concatMap`: one after another

Use `concatMap` when each operation should start only after the previous
inner observable completes.

```typescript
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

from([1, 2, 3])
  .pipe(concatMap((id) => this.http.post('/api/save', { id })))
  .subscribe({
    next: (result) => console.log(result),
    error: (error) => console.error(error),
  });
```

- Request 1 starts first.
- Request 2 starts only after request 1 completes.
- Request 3 starts only after request 2 completes.
- Incoming source values are queued while an inner observable is
  active.
- If requests are slow and inputs arrive quickly, the queue can grow.

**Remember:** `concatMap` = queue and process sequentially.

## 5. `switchMap`: latest input wins

Use `switchMap` when a newer input makes the result from an older
request no longer useful.

```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((query) =>
      this.http.get('/api/search', {
        params: { q: query ?? '' },
      }),
    ),
  )
  .subscribe({
    next: (results) => console.log(results),
    error: (error) => console.error(error),
  });
```

- When a new search term arrives, `switchMap` unsubscribes from the
  previous inner observable.
- Only the latest active inner observable continues to send values to
  the subscriber.
- With Angular `HttpClient`, unsubscribing from an in-flight request
  normally aborts the client-side request.
- It does **not** guarantee that the server never received or
  processed the earlier request.

Good use cases include autocomplete, route-parameter-driven data
loading, and filters where only the latest selection matters.

Avoid relying on cancellation alone to protect irreversible operations
such as payments or saves.

**Remember:** `switchMap` = cancel the previous subscription and switch
to the latest.

## 6. `exhaustMap`: ignore new triggers while busy

Use `exhaustMap` when the first trigger should run to completion and
additional triggers should be ignored until it finishes.

```typescript
import { exhaustMap } from 'rxjs/operators';

this.submitClicks.pipe(exhaustMap(() => this.http.post('/api/submit', this.form.value))).subscribe({
  next: (result) => console.log(result),
  error: (error) => console.error(error),
});
```

- The first click starts the request.
- Further clicks while it is running are ignored.
- Once the request completes, the next click can start another
  request.
- Ignored triggers are not queued.

Good use cases include preventing duplicate submit triggers or repeated
login attempts from starting overlapping requests. Server-side
idempotency and validation are still important for critical operations.

**Remember:** `exhaustMap` = accept the first trigger, ignore new
triggers while busy.

## 7. Timeline intuition

Assume inputs A, B, and C arrive one second apart, and each request
takes three seconds.

- **`mergeMap`:** A, B, and C can all run concurrently. Results arrive
  as each completes.
- **`concatMap`:** A runs, then B, then C. Total time is about nine
  seconds, ignoring overhead.
- **`switchMap`:** B replaces A, and C replaces B. If no newer input
  arrives, C is the request that remains subscribed long enough to
  emit.
- **`exhaustMap`:** A runs; B and C are ignored while A is active.
- **`forkJoin`:** If given three finite observables for A, B, and C,
  it emits their combined final values after all complete.

## 8. Decision guide

Ask yourself what should happen when a new source value arrives:

1.  **I need all API results together:** `forkJoin`
2.  **I want requests to overlap:** `mergeMap`
3.  **I must preserve sequential execution:** `concatMap`
4.  **Only the newest request matters:** `switchMap`
5.  **Ignore repeated triggers while one request is active:**
    `exhaustMap`

## 9. Common interview questions

### Does `mergeMap` wait for all requests before emitting?

No. It emits each inner result as it arrives. However, the overall
observable completes only after the source completes and all active
inner observables complete.

### Does `forkJoin` run requests sequentially?

No. It subscribes to its supplied observables; typical HTTP observables
start concurrently. It waits to emit the combined result until all have
completed.

### What happens if one `forkJoin` request is slow?

The combined result waits for that request and every other input to
complete.

### Does `switchMap` cancel an HTTP request?

It unsubscribes from the previous inner observable. Angular `HttpClient`
normally aborts the client-side request, but the server may already have
received or processed it.

### What is the difference between `concatMap` and `exhaustMap`?

`concatMap` queues new values and processes them later. `exhaustMap`
discards new values while the current inner observable is active.

### What is the difference between `mergeMap` and `switchMap`?

`mergeMap` keeps previous inner subscriptions active and permits
concurrency. `switchMap` unsubscribes from the previous inner observable
when a new source value arrives.

### What happens when an API errors?

Unless the error is caught and handled, an error can terminate the outer
observable. For resilient per-request handling, use `catchError` inside
the projection when appropriate:

```typescript
from([1, 2, 3])
  .pipe(
    mergeMap((id) =>
      this.http.get(`/api/users/${id}`).pipe(
        catchError((error) => {
          console.error(`User ${id} failed`, error);
          return of(null);
        }),
      ),
    ),
  )
  .subscribe((result) => console.log(result));
```

Remember to import `catchError` and `of` from `rxjs` / `rxjs/operators`
as appropriate for your RxJS version (`catchError` is commonly imported
from `rxjs/operators`; `of` from `rxjs`).

## 10. One-line memory trick

- `forkJoin` --- **all together at the end**
- `mergeMap` --- **concurrent**
- `concatMap` --- **queue**
- `switchMap` --- **latest wins**
- `exhaustMap` --- **ignore while busy**
