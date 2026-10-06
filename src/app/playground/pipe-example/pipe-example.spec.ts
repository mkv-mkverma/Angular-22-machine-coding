import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeExample } from './pipe-example';

describe('PipeExample', () => {
  let component: PipeExample;
  let fixture: ComponentFixture<PipeExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipeExample],
    }).compileComponents();

    fixture = TestBed.createComponent(PipeExample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
