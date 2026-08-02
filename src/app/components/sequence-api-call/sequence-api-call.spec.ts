import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceApiCall } from './sequence-api-call';

describe('SequenceApiCall', () => {
  let component: SequenceApiCall;
  let fixture: ComponentFixture<SequenceApiCall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceApiCall],
    }).compileComponents();

    fixture = TestBed.createComponent(SequenceApiCall);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
