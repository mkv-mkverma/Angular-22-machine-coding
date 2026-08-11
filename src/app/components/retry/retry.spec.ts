import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Retry } from './retry';

describe('Retry', () => {
  let component: Retry;
  let fixture: ComponentFixture<Retry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Retry],
    }).compileComponents();

    fixture = TestBed.createComponent(Retry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
