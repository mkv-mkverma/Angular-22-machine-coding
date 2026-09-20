import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryLeak } from './memory-leak';

describe('MemoryLeak', () => {
  let component: MemoryLeak;
  let fixture: ComponentFixture<MemoryLeak>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryLeak],
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryLeak);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with the child unmounted', () => {
    expect(component.showChild()).toBe(false);
  });

  // Note: intentionally does not call detectChanges() after toggling, so the leaky
  // child never actually mounts here — its timers/listeners are exercised in
  // memory-leak-child.spec.ts instead, under fake timers.
  it('toggleChild mounts the child and bumps mountCount', () => {
    component.toggleChild();

    expect(component.showChild()).toBe(true);
    expect(component.mountCount()).toBe(1);
  });
});
