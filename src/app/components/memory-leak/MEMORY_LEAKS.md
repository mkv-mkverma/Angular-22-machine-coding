# Memory Leak Playground

Two components:

- [`memory-leak.ts`](./memory-leak.ts) — parent. A button mounts/unmounts
  [`app-memory-leak-child`](./memory-leak-child.ts) with `@if`, so you can create and destroy
  instances repeatedly.
- [`memory-leak-child.ts`](./memory-leak-child.ts) — the leaky one. Every leak below lives here,
  and `ngOnDestroy` is deliberately left incomplete so none of them get cleaned up.

## How to see it

1. `npm start`, open `/memory-leak`, open the browser console.
2. Click **Mount child**, wait a few seconds, click **Destroy child**.
3. Watch the console — `[interval$] still ticking` and `[setInterval] still running` keep
   logging after destroy, proving the timers/subscription outlived the component.
4. Click **Clone + leak this node** a few times before destroying, then in DevTools →
   Memory, take a heap snapshot, mount/destroy the child 5-10 times, force GC, take another
   snapshot, and diff. You'll see retained `MemoryLeakChild` instances and detached
   `HTMLButtonElement` nodes that should have been collected.

## Leak catalog

| # | Leak | Where | Root cause |
|---|------|-------|------------|
| 1 | RxJS subscription | `memory-leak-child.ts` — `intervalSub` field initializer | `interval(1000).subscribe(...)` with no `takeUntilDestroyed()`, no `unsubscribe()` in `ngOnDestroy`. The interval keeps emitting into the destroyed instance forever, which also keeps the instance itself reachable. |
| 2 | `setInterval` timer | `memory-leak-child.ts` — `intervalHandle` field initializer | Handle is stored but `clearInterval(this.intervalHandle)` is never called. |
| 3 | Self-rescheduling `setTimeout` | `memory-leak-child.ts` — `scheduleTimeoutLeak()` | Each callback schedules the next one before finishing, so even clearing `timeoutHandle` would only ever cancel the *current* timer — a new one is always already queued. |
| 4 | Global event listeners | `memory-leak-child.ts` — `document.addEventListener('mousemove', ...)`, `window.addEventListener('resize', ...)` in `ngOnInit` | `document`/`window` outlive the component; the listeners are attached but never removed with `removeEventListener` in `ngOnDestroy`. |
| 5 | Detached DOM node | `memory-leak-child.ts` — `leakDomNode()` pushing into module-level `detachedNodes` array | Cloning a node into a variable that lives outside Angular's lifecycle (module scope) keeps that DOM node — and everything it references — reachable forever, even once it's removed from the visible DOM. |
| 6 | Closure capturing `this` | `memory-leak-child.ts` — `leakDomNode()` pushing into module-level `leakedClosures` array | The pushed arrow function closes over `this`, so the entire component instance (including `largePayload`, a stand-in for real component state) stays reachable as long as the array does. |

## Why `ngOnDestroy` doesn't help here

`ngOnDestroy()` exists in `memory-leak-child.ts` and Angular does call it when the parent's
`@if` removes the child — but it only logs. None of leaks #1-4 are torn down there, and #5/#6
can't be fixed in `ngOnDestroy` at all, because the leaked references live in module scope, not
on the component instance.

## The fixes (for the write-up / interview answer)

- **#1 RxJS subscription** — prefer `toSignal()`/`AsyncPipe` (owns and cleans up the
  subscription automatically), or pipe through `takeUntilDestroyed()`, or keep a
  `Subscription` and call `.unsubscribe()` in `ngOnDestroy`.
- **#2 `setInterval`** — `clearInterval(this.intervalHandle)` in `ngOnDestroy`.
- **#3 self-rescheduling `setTimeout`** — guard the reschedule with a `DestroyRef.onDestroy()`
  callback (or a boolean flag flipped in `ngOnDestroy`) so it stops requeueing once destroyed,
  in addition to clearing the current handle.
- **#4 global listeners** — `removeEventListener` with the *same* bound function reference in
  `ngOnDestroy` (must be a stored arrow/bound method, not a fresh inline function each time), or
  use `@HostListener` on `window`/`document` and let Angular manage it, or
  `DestroyRef.onDestroy(() => ...)`.
- **#5 detached DOM node** — don't stash DOM references in module-level/service/global state.
  If you need to cache something, cache data, not nodes, and clear the cache explicitly.
- **#6 closure capturing `this`** — avoid pushing closures that capture `this` (or component
  state) into long-lived singleton/global collections; capture only the primitive values you
  actually need, or explicitly remove the entry when the component is destroyed.

## Other common Angular leak sources (not demoed here)

- Subscribing to a shared service's `Subject`/`EventEmitter`/`BehaviorSubject` without
  unsubscribing — the service is a singleton and outlives every component that used it.
- `Renderer2.listen(...)` — it returns an unlisten function that must be called; unlike
  `@HostListener`, Angular does not clean this up for you.
- Third-party widgets/libraries with their own `init()`/`destroy()` lifecycle (charts, maps,
  editors) that need an explicit teardown call in `ngOnDestroy`.
- Long-lived caches (e.g. `shareReplay({ bufferSize: 1, refCount: false })`, per this repo's
  caching pattern in `src/app/services/users.ts`) holding onto stale data indefinitely — usually
  fine and intentional, but worth knowing it's a deliberate trade-off, not a leak by accident.
