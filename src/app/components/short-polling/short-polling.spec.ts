import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortPolling } from './short-polling';

describe('ShortPolling', () => {
  let component: ShortPolling;
  let fixture: ComponentFixture<ShortPolling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortPolling],
    }).compileComponents();

    fixture = TestBed.createComponent(ShortPolling);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
