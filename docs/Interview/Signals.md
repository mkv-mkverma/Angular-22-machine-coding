# Angular Signals — Quick Revision

## What is a Signal?

A **reactive value holder** that knows who reads it. When the value changes, only the consumers that read it are re-evaluated — no zone, no dirty-checking the whole tree.

```ts
const count = signal(0);
count();          // read  -> 0
count.set(5);     // write
count.update(c => c + 1);  // write based on previous
```

- Reading inside a template/computed/effect **registers a dependency** (tracking).
- `mutate()` no longer exists — use `update()` and return a new reference for objects/arrays.

```ts
users.update(list => [...list, newUser]);   // ✅ new reference
```

## The three primitives

| API | Type | Purpose |
| --- | --- | --- |
| `signal(v)` | Writable | Source of truth |
| `computed(fn)` | Read-only | Derived value, **lazy + memoized** |
| `effect(fn)` | Side effect | Runs when its dependencies change |

```ts
firstName = signal('Manish');
lastName  = signal('Verma');
fullName  = computed(() => `${this.firstName()} ${this.lastName()}`);

constructor() {
  effect(() => console.log('name changed:', this.fullName()));
}
```

**computed is lazy** — the fn doesn't run until someone reads it, and it caches until a dependency changes.

## Glitch-free / equality

Signals dedupe with `Object.is` by default. Setting the same value = no notification.

```ts
const user = signal(obj, { equal: (a, b) => a.id === b.id });
```

## `effect()` essentials

- Runs **once** initially, then on dependency change.
- Auto-cleaned up when the injection context (component) is destroyed.
- Needs an injection context (field initializer / constructor) or an explicit `{ injector }`.
- Don't `set()` signals inside an effect for derived state — use `computed`/`linkedSignal`.

```ts
effect((onCleanup) => {
  const id = setInterval(() => poll(this.query()), 1000);
  onCleanup(() => clearInterval(id));
});
```

Escape tracking with `untracked()`:

```ts
effect(() => {
  const q = this.query();              // tracked
  untracked(() => this.logger.log(q)); // reads inside are NOT tracked
});
```

## `linkedSignal` — writable derived state

Derived like `computed`, but you can still override it locally; it **resets** when the source changes.

```ts
options  = signal(['S', 'M', 'L']);
selected = linkedSignal(() => this.options()[0]);  // resets when options change
this.selected.set('L');                             // but still writable
```

Classic use case: a selected row / selected tab that must reset when the list reloads.

## `resource` / `rxResource` — async data as signals

```ts
userResource = rxResource({
  params: () => ({ id: this.userId() }),          // re-fetches when it changes
  stream: ({ params }) => this.http.get<User>(`/users/${params.id}`),
});

// template
@if (userResource.isLoading()) { ... }
{{ userResource.value()?.name }}
{{ userResource.error() }}
userResource.reload();
```

## Signal-based component API

```ts
// inputs
name = input<string>();                 // Signal<string | undefined>
id   = input.required<number>();        // Signal<number>
age  = input(0, { transform: numberAttribute });

// two-way
value = model<string>('');              // [(value)] — .set()/.update() emits

// output
saved = output<User>();                 // this.saved.emit(user)

// queries
row  = viewChild<ElementRef>('row');    // Signal<ElementRef | undefined>
rows = viewChildren(RowComponent);      // Signal<readonly RowComponent[]>
```

## RxJS interop

```ts
todos = toSignal(this.http.get<Todo[]>('/getTodos'), { initialValue: [] });
query$ = toObservable(this.query);       // signal -> Observable
```

- `toSignal` subscribes immediately and unsubscribes on destroy — no manual cleanup.
- `toObservable` is backed by an effect, so it emits **on the next microtask**, not synchronously.

---

# Common Interview Questions

**1. Signals vs RxJS — when to use what?**
Signals for **synchronous state** read by the template (values you always "have"). RxJS for **streams/events over time** — debounce, retry, cancellation, websockets. They interop via `toSignal`/`toObservable`. Rule of thumb: state → signal, events → observable.

**2. Signals vs BehaviorSubject?**
Both hold a current value. Signals are synchronous, glitch-free, auto-tracked (no subscription, no leak, no `async` pipe), and integrate with change detection. `BehaviorSubject` gives you operators and explicit subscription lifecycle.

**3. `computed` vs `effect`?**
`computed` **produces a value**, is pure, lazy and memoized. `effect` **does something** (logging, localStorage, DOM, analytics) and returns nothing. If you're calling `set()` inside an `effect`, you probably wanted `computed` or `linkedSignal`.

**4. Why is `computed` lazy?**
It only recomputes when read **and** a dependency actually changed — cheap derived chains, no wasted work for values not currently rendered.

**5. How do signals improve change detection?**
Angular marks only the components that read the changed signal as dirty (`markAncestorsForTraversal`) instead of dirty-checking the whole tree — this is what enables **zoneless** apps (`provideZonelessChangeDetection()`).

**6. Why doesn't my signal update when I push to an array?**
`update(l => l.push(x))` mutates the same reference; `Object.is` sees no change. Return a new array: `update(l => [...l, x])`.

**7. `effect` in constructor vs `ngOnInit`?**
`effect()` needs an injection context, so constructor/field initializer. In `ngOnInit` you must pass `{ injector: this.injector }`.

**8. What is `untracked` for?**
Reading a signal without subscribing to it — e.g. an effect that should re-run for `query()` but only *read* the current user id, avoiding an unwanted dependency and re-run loops.

**9. `linkedSignal` vs `computed`?**
`computed` is read-only. `linkedSignal` is writable but resets to the derived value when its source changes — ideal for "selection that resets on list reload".

**10. Are signals a replacement for NgRx / a store?**
No. Signals are a primitive; a store adds structure (actions, reducers, devtools, effects). Small/medium state → signals in a service (`@Service()` with `signal` fields + `computed` selectors) is often enough.

**11. Does `toSignal` need manual unsubscribe?**
No — it ties the subscription to the injection context. Outside one, pass `{ injector }` or `{ manualCleanup: true }`.

**12. Can signals be used in services?**
Yes — the common pattern for shared state:

```ts
@Service()
export class CartStore {
  private items = signal<Item[]>([]);
  readonly all   = this.items.asReadonly();
  readonly total = computed(() => this.all().reduce((s, i) => s + i.price, 0));
  add(i: Item) { this.items.update(list => [...list, i]); }
}
```

`asReadonly()` exposes reads while keeping writes inside the service.
