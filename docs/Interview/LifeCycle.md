# Angular Lifecycle Hooks

Order in which Angular calls these during a component's life:

| # | Hook | Runs |
|---|------|------|
| — | `constructor()` | Once, on instantiation (not a lifecycle hook) |
| 1 | `ngOnChanges()` | Before `ngOnInit`, then whenever a bound `@Input()` changes |
| 2 | `ngOnInit()` | Once, after the first `ngOnChanges()` |
| 3 | `ngDoCheck()` | On every change-detection run |
| 4 | `ngAfterContentInit()` | Once, after projected content (`<ng-content>`) is initialized |
| 5 | `ngAfterContentChecked()` | After every check of projected content |
| 6 | `ngAfterViewInit()` | Once, after the component's view and child views are initialized |
| 7 | `ngAfterViewChecked()` | After every check of the component's view |
| 8 | `ngOnDestroy()` | Once, just before Angular destroys the component |

## `constructor()`

Not a lifecycle hook — it's the plain JavaScript/TypeScript constructor. Commonly used for dependency injection.

## `ngOnChanges()`

Runs whenever an `@Input()` property's value changes. For objects and arrays, Angular detects changes based on the reference, not internal mutations.

## `ngOnInit()`

Runs once after Angular initializes the component. If the component has `@Input()` properties, their initial values are set before `ngOnInit()` runs. Commonly used for initial component setup and API calls.

## `ngDoCheck()`

Runs during Angular's change-detection process. Can run many times.

## `ngAfterContentInit()`

Runs once after Angular initializes content projected into the component using `<ng-content>`.

## `ngAfterContentChecked()`

Runs after Angular checks the projected content. Can run many times.

## `ngAfterViewInit()`

Runs once after the component's and its child view/template have been initialized. Commonly used with `@ViewChild()`.

## `ngAfterViewChecked()`

Runs after Angular checks the component's view. Can run many times.

## `ngOnDestroy()`

Runs before Angular destroys the component. Used for cleanup: subscriptions, timers, DOM event listeners, WebSocket connections, third-party libs (e.g. `chart.destroy()`), etc.
