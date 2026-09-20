import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmitOneSec } from './emit-one-sec';

describe('EmitOneSec', () => {
  let component: EmitOneSec;
  let fixture: ComponentFixture<EmitOneSec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitOneSec],
    }).compileComponents();

    fixture = TestBed.createComponent(EmitOneSec);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
