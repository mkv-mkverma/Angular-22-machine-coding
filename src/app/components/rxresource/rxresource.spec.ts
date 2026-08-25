import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rxresource } from './rxresource';

describe('Rxresource', () => {
  let component: Rxresource;
  let fixture: ComponentFixture<Rxresource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rxresource],
    }).compileComponents();

    fixture = TestBed.createComponent(Rxresource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
