cold : A normal Observable is generally cold—each subscription can start a separate execution.
HOT: Subject is both an Observable and an Observer and is used to multicast values to subscribers.
shared stream + no initial value + no replay

BehaviorSubject is a Subject that stores the latest value and immediately gives it to new subscribers
const user$ = new BehaviorSubject('Guest');
user$.next('Manish');
user$.subscribe(x => console.log(x));
BehaviorSubject = Subject + latest value

ReplaySubject = Subject + replay history
onst subject$ = new ReplaySubject(2);

subject$.next(10);
subject$.next(20);
subject$.next(30);

subject$.subscribe(x => console.log(x));

Output:20 30

Observable
↓
Normal stream

Promise
↓
One result

Subject
↓
Shared stream

BehaviorSubject
↓
Shared + latest value

ReplaySubject
↓
Shared + history

AsyncSubject
↓
Shared + final value after complete

share() share current execution, don't replay old value.
shareReplay() remembers and replays them

Cold Observable
→ Each subscriber gets a separate execution
→ Can be converted to shared/multicast behavior using share() / shareReplay()

Multicasting
→ Multiple subscribers share ONE, source of execution
→ Examples: Subject, share(), shareReplay()

Hot Observable
→ Source produces values independently of subscribers
→ Subscribers receive the values produced while they are subscribed
→ Example: DOM events, Subject

BehaviorSubject → RxJS reactive state; update with .next(), read via .subscribe().
Signal → Angular reactive state; update with .set()/.update(), read via signal().

BehaviorSubject is a Subject that stores the latest value, requires an initial value, and allows us to push values using next(). shareReplay(1) is an RxJS operator that shares one source subscription and replays the latest emitted value to new subscribers. I would typically use BehaviorSubject for manually managed state and shareReplay(1) for sharing or caching an Observable such as an HTTP request.


shareReplay(1) shares one execution and replays the latest value to new subscribers, so it is commonly used to cache HTTP/API responses

from(fetch('/users')).subscribe(console.log);
Waits for the Promise to resolve, then emits the resolved value.
Convert Promise to Observable
Convert arrays or iterables into streams

showLoader();

this.http.get('api/users')
.pipe(
tap(() => console.log("API Called")),
finalize(() => hideLoader())
)
.subscribe();

find() : Returns the first matching element/Object/Value. Stops searching immediately after finding it.

filter(): Returns all matches. Returns Array


debounceTime() Wait until user stops doing something,then emit latest value.
waits for a specified time and resets the timer whenever a new value arrives. It emits only when the user stops emitting values for that time.
Ex: Autocomplete, Autosave, validation

Wait until the user stops typing for a specified time, then emit the latest value.
searchControl.valueChanges.pipe(
  debounceTime(500),
  switchMap(query =>
    this.http.get(`https://dummyjson.com/products/search?q=${query}`)
  )
).subscribe(res => {
  console.log(res);
});



throttleTime(): Emit the first value immediately. Emit immediately, ignore the rest for some time.
Button CLick
Emit the first value immediately, then ignore values for a specified time.
fromEvent(window, 'scroll').pipe(
  throttleTime(1000)
).subscribe(() => {
  this.http.get('https://dummyjson.com/products')
    .subscribe(res => console.log(res));
});

auditTime(): Wait for the duration. Then emit the latest value. scroll, window resize, mouse movement

Wait for the specified time, then emit the latest value received during that period.

sampleTime(): emit the latest value available.At fixed intervals.
Live dashboard, IOT sensor
At every fixed interval, check the source and emit the latest value.

switchMap unsubscribes from the previous inner observable whenever a new value comes from the source observable. It always keeps only the latest request active.
Ex: Search autocomplete, Live search, Route parameter changes

exhaustMap ignores new source emissions while the current inner observable is still running.
Ex: Login button, Payment button, Save button, OTP verification

concatMap queues inner observables and executes them one after another. The next observable starts only after the previous one completes.
Ex: File uploads, Sequential API calls, Order processing

forkJoin subscribes to multiple observables in parallel and emits once when all observables complete successfully. It returns the last emitted value from each observable as a single object or array.
Ex: Dashboard page, User profile page, Initial page load, Load multiple independent APIs together

mergeMap subscribes to every inner observable immediately. All inner observables run concurrently, and their results can arrive in any order.
Ex: Infinite scroll, Multiple API calls, Save multiple records, Download multiple files

combineLatest combines the latest value from each observable and emits whenever any observable emits, after every observable has emitted at least once.

combineLatest([
user$,
  settings$
]).subscribe(([user, settings]) => {
console.log(user, settings);
});

withLatestFrom() lets the main Observable trigger, while taking the latest value from another Observable.

save$ = this.saveButton$.pipe(
withLatestFrom(this.form.valueChanges),
switchMap(([_, form]) => this.api.save(form))
);

Form changes → no API ❌
Form changes → no API ❌
Click Save → latest form → API ✅

zip() waits for each Observable to give one value, then combines those values and emits them together.

I use zip() when I need to pair emissions from multiple Observables based on their order—for example, when the first value from one stream needs to be combined with the first value from another stream.

Merge Map Example
import { from, of, throwError } from 'rxjs';
import { catchError, delay, mergeMap } from 'rxjs/operators';

const students = [1, 2, 3];

function getMarksheet(id: number) {
if (id === 2) {
return throwError(() => new Error('Student 2 not found'));
}

return of(`Marksheet of Student ${id}`).pipe(delay(1000));
}

from(students).pipe(
mergeMap(id => getMarksheet(id).pipe(catchError(()=>of([]))))
).subscribe({
next: value => console.log(value),
error: err => console.log("ERROR:", err.message),
complete: () => console.log("Completed")
});

How do you know an Observable is completed?
next emits values, while error and complete terminate the Observable.

next → sends a value → Observable continues
error → terminates → no more values
complete → terminates → no more values

observable$.subscribe({
next: value => console.log(value),
error: err => console.log('Failed'),
complete: () => console.log('Completed')
});




Dashboard has 20 APIs. How will you load faster?

I'd divide the 20 APIs into critical and non-critical groups. The five critical APIs would be executed in parallel using forkJoin and used for the initial render. APIs that are useful immediately but don't block rendering would start after the initial view is rendered. For below-the-fold widgets I'd use Angular's @defer (on viewport) so the API is only triggered when that widget becomes visible. For tab-specific data, I'd trigger the API when the user opens that tab. This way I'm not firing all 20 requests on initial page load

async => For displaying Observable data in the template, I prefer async because Angular manages the subscription lifecycle. For imperative operations or side effects such as navigation, notifications, or triggering another action, I use subscribe().

RxJS memory leaks mainly happen when long-lived observables continue emitting after the component or consumer is destroyed. Common causes are subscriptions that aren't cleaned up, Subjects or BehaviorSubjects, intervals and timers, DOM event streams, repeated subscriptions, and nested subscriptions. In modern Angular, I usually use AsyncPipe or takeUntilDestroyed() to manage the subscription lifecycle.

Angular HttpClient observables normally complete after the response, so a simple one-shot HTTP call generally doesn't require manual unsubscribe.

interval(1000)
.pipe(takeUntilDestroyed())
.subscribe();

fromEvent(window, 'resize')
.subscribe(() => {
// ...
});

We use takeUntilDestroyed() to automatically unsubscribe from observables when an Angular component or directive is destroyed. It helps prevent memory leaks and eliminates the need for manually creating a destroy$

When subscribe() is called, RxJS creates a subscription and executes the Observable's subscription logic. The producer starts emitting values, which are delivered through next, error, and complete. subscribe() returns a Subscription, and calling unsubscribe() triggers the teardown logic and stops the subscription.

⭐Observable to signal
import { toSignal } from '@angular/core/rxjs-interop';
users$ = this.userService.getUsers();
// Angular manages the subscription created by toSignal().
users = toSignal(this.users$, {
initialValue: []
});
<div *ngFor="let user of users()">
  {{ user.name }}
</div>

⭐signal to observable
searchTerm = signal('');
searchTerm$ = toObservable(this.searchTerm);

searchTerm$
.pipe(
debounceTime(300),
distinctUntilChanged()
)
.subscribe(value => {
console.log(value);
});

How does AsyncPipe unsubscribe automatically?
users$ = this.userService.getUsers();
<div *ngFor="let user of users$ | async">
  {{ user.name }}
</div>
Observable
    ↓
AsyncPipe
    ↓
subscribe()
    ↓
receive values
    ↓
update template
    ↓
Component destroyed
    ↓
AsyncPipe.ngOnDestroy()
    ↓
unsubscribe()

internal working
transform(observable$) {
  this.subscription = observable$.subscribe(value => {
this.value = value;
this.changeDetector.markForCheck();
});

return this.value;
}

And when Angular destroys the pipe/view, it performs cleanup:

ngOnDestroy() {
this.subscription.unsubscribe();
}

tap() RxJS side effect, doesn't transform the emitted value.
Logging,Debugging,Analytics,Setting loading flags,Triggering an external side effect

effect() is used for side effects that need to run when Signals they read change.
automatically tracks the Signals read inside it and reruns when those Signals change.

computed() is a lazy Signal that calculates and caches a value based on the Signals it reads.

to stop polling

takeUntil(stopPolling$)
timer(0, 5000).pipe(
switchMap(() => this.getStatus()),
takeWhile(status => status !== 'COMPLETED', true)
);

Can HttpClient Observable emit multiple values?
Angular HttpClient Observables are cold and single-response Observables

const users$ = this.http.get<User[]>('/api/users');

subscribe()
↓
HTTP request
↓
next(response)
↓
complete()

users$.subscribe({
next: users => console.log(users), // once
error: err => console.log(err),
complete: () => console.log('done')
});

An Observable can emit multiple values:But a normal HttpClient.get() single value
for multiple use
timer(0, 10000).pipe(
switchMap(() => this.http.get('/api/users'))
);

no sub no emmit
HttpClient Observables are cold/lazy.
AsyncPipe / toSignal() subscribes for you.

returns new observable
users$.pipe(
map(users => users.filter(u => u.active)),
catchError(() => of([]))
);
subscribe() → start/listen to the Observable

pipe() is used to compose RxJS operators and transform an Observable, while subscribe() is used to consume the Observable and trigger execution for cold Observables.

tap() is for observing values or notifications and performing side effects without changing the stream.

finalize() is for cleanup logic that must run when the Observable terminates, either through completion, error, or unsubscription.

this.loading = true;

this.http.get('/api/users').pipe(
tap({
next: value => console.log(value),
error: err => console.log(err),
complete: () => console.log('completed')
})
finalize(() => {
this.loading = false;
})
).subscribe();

catchError() is an RxJS operator used to intercept an error and return a replacement Observable. throwError() creates an Observable that emits an error, commonly used when I want to rethrow an error after handling or logging it.

catchError(error => {
console.error(error);
<!-- return of([]); // fallback value -->

return throwError(() => error);
})

50.

Can you call API inside map() Why not?
Technically I can return an API Observable from map(), but map() doesn't flatten it, so I end up with a nested Observable. For asynchronous API calls I use a flattening operator such as switchMap, mergeMap, concatMap, or exhaustMap, depending on the required behavior."

| Operator   | Return type                  | Emits                              | Completes when                                        | If no match                                      |
| ---------- | ---------------------------- | ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `filter()` | `Observable<T>`              | All matching values                | **Source completes**                                  | Just emits nothing                               |
| `find()`   | `Observable<T \| undefined>` | First matching value               | **Immediately after match**, or when source completes | Emits `undefined` then completes                 |
| `take(n)`  | `Observable<T>`              | First `n` values                   | **After n values**                                    | If source completes before n, completes normally |
| `first()`  | `Observable<T>`              | First value / first matching value | **Immediately after first match**                     | `EmptyError`                                     |

Cold Observable → Each subscriber gets its own execution/data.

const obs$ = new Observable(observer => {
console.log('API called');
observer.next(Math.random());
});

obs$.subscribe(x => console.log('A:', x));
obs$.subscribe(x => console.log('B:', x));

Each subscription starts the Observable again.

Example: HttpClient.get() — normally cold

Hot Observable → The data/execution is shared between subscribers.

const subject$ = new Subject<number>();

subject$.subscribe(x => console.log('A:', x));

subject$.next(10);

subject$.subscribe(x => console.log('B:', x));

subject$.next(20);

A: 10
A: 20
B: 20

Why HttpClient returns Observable instead of Promise?

HttpClient returns an Observable because Angular is built around RxJS. Observables are lazy, cancellable through unsubscribe, and provide powerful operators like map, switchMap, retry, and catchError. A normal HTTP Observable emits the response once and then completes.

I'll use from() to create a stream of the API URLs and mergeMap() with a concurrency of 2. This ensures that only two HTTP requests are active at any time.

for static url

import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const urls = [
'https://dummyjson.com/products/1',
'https://dummyjson.com/products/2',
'https://dummyjson.com/products/3',
'https://dummyjson.com/products/4',
'https://dummyjson.com/products/5'
];

from(urls).pipe(
mergeMap(url => this.http.get(url), 2)
).subscribe(res => {
console.log(res);
});

for Dynamic ID url

this.http.get<number[]>('/api/product-ids').pipe(
mergeMap(ids => from(ids)),
mergeMap(
id => this.http.get(`https://dummyjson.com/products/${id}`),
2
)
).subscribe();
