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
