import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { interval } from 'rxjs';

// Leak #5/#6: module-level state outlives every component instance. Anything pushed in here
// (DOM nodes, closures capturing `this`) stays reachable forever, so the GC can never
// collect it — even after the component and its host element are removed from the DOM.
const detachedNodes: HTMLElement[] = [];
const leakedClosures: (() => void)[] = [];

@Component({
  selector: 'app-memory-leak-child',
  imports: [],
  templateUrl: './memory-leak-child.html',
  styleUrl: './memory-leak-child.scss',
})
export class MemoryLeakChild implements OnInit, OnDestroy {
  @ViewChild('leakTarget') leakTarget!: ElementRef<HTMLElement>;

  intervalTicks = signal(0);
  timeoutTicks = signal(0);
  mouseX = signal(0);
  mouseY = signal(0);
  windowWidth = signal(window.innerWidth);
  leakedNodeCount = signal(0);

  // Stands in for "real" component state that a leaked reference would keep alive.
  private largePayload = new Array(50_000).fill('leaked-data');

  // Leak #1: RxJS subscription started in a field initializer and never unsubscribed —
  // no takeUntilDestroyed(), no manual teardown. The interval keeps emitting into this
  // component instance forever, which also keeps the instance itself alive.
  private intervalSub = interval(1000).subscribe(() => {
    this.intervalTicks.update((n) => n + 1);
    console.log('[interval$] still ticking:', this.intervalTicks());
  });

  // Leak #2: setInterval handle is stored but never passed to clearInterval anywhere.
  private intervalHandle = setInterval(() => {
    console.log('[setInterval] still running');
  }, 1500);

  // Leak #3: self-rescheduling setTimeout. Even if ngOnDestroy cleared `timeoutHandle`,
  // it would only ever clear the *current* handle — a new one is always already scheduled.
  private timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  private scheduleTimeoutLeak(): void {
    this.timeoutHandle = setTimeout(() => {
      this.timeoutTicks.update((n) => n + 1);
      this.scheduleTimeoutLeak();
    }, 2000);
  }

  // Leak #4: listeners attached to `document`/`window` (globals that outlive the component)
  // using bound instance methods, but never removed with removeEventListener.
  private onMouseMove = (event: MouseEvent): void => {
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  };

  private onResize = (): void => {
    this.windowWidth.set(window.innerWidth);
  };

  ngOnInit(): void {
    this.scheduleTimeoutLeak();
    document.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  // Leak #5 + #6 trigger: clones the button into a detached DOM node and pushes a closure
  // that captures `this`, both stashed in the module-level arrays above.
  leakDomNode(): void {
    const node = this.leakTarget.nativeElement.cloneNode(true) as HTMLElement;
    detachedNodes.push(node);
    leakedClosures.push(() => console.log('closure still holds', this.largePayload.length, 'items'));
    this.leakedNodeCount.set(detachedNodes.length);
    console.log('Leaked DOM nodes:', detachedNodes.length, '— leaked closures:', leakedClosures.length);
  }

  ngOnDestroy(): void {
    // Intentionally incomplete — see MEMORY_LEAKS.md.
    // intervalSub is never unsubscribed, intervalHandle/timeoutHandle are never cleared,
    // and the document/window listeners are never removed, so all of them keep firing
    // (and keep this component instance reachable) long after Angular destroys it.
    console.log('MemoryLeakChild destroyed — but its timers, subscription and listeners live on.');
  }
}
