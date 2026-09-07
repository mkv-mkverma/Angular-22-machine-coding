# RxJS Interview Notes

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
    refCount: true
  })
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
