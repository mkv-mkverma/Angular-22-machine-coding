import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsingReusableTable } from './using-reusable-table';

describe('UsingReusableTable', () => {
  let component: UsingReusableTable;
  let fixture: ComponentFixture<UsingReusableTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsingReusableTable],
    }).compileComponents();

    fixture = TestBed.createComponent(UsingReusableTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
