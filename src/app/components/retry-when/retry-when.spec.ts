import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetryWhen } from './retry-when';

describe('RetryWhen', () => {
  let component: RetryWhen;
  let fixture: ComponentFixture<RetryWhen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetryWhen],
    }).compileComponents();

    fixture = TestBed.createComponent(RetryWhen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
