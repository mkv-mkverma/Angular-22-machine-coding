import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentryTest } from './sentry-test';

describe('SentryTest', () => {
  let component: SentryTest;
  let fixture: ComponentFixture<SentryTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentryTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SentryTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
