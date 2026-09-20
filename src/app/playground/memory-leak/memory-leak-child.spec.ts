import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryLeakChild } from './memory-leak-child';

describe('MemoryLeakChild', () => {
  let component: MemoryLeakChild;
  let fixture: ComponentFixture<MemoryLeakChild>;

  beforeEach(async () => {
    // Fake timers so the deliberately-uncleared interval()/setInterval/setTimeout in this
    // component never schedule real OS timers that would keep the test process alive.
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [MemoryLeakChild],
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryLeakChild);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ticks the interval$ subscription forward', () => {
    vi.advanceTimersByTime(3000);
    expect(component.intervalTicks()).toBe(3);
  });

  it('keeps ticking after the component is destroyed — that is the leak', () => {
    vi.advanceTimersByTime(1000);
    const ticksBeforeDestroy = component.intervalTicks();

    fixture.destroy();
    vi.advanceTimersByTime(2000);

    expect(component.intervalTicks()).toBeGreaterThan(ticksBeforeDestroy);
  });
});
