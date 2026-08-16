import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombineLatest } from './combine-latest';

describe('CombineLatest', () => {
  let component: CombineLatest;
  let fixture: ComponentFixture<CombineLatest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombineLatest],
    }).compileComponents();

    fixture = TestBed.createComponent(CombineLatest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits the latest email and password values', () => {
    const values: [string | null, string | null][] = [];
    const subscription = component.data$.subscribe((value) => values.push(value));

    component.emailControl.setValue('manish@example.com');
    component.passwordControl.setValue('secret');

    expect(values.at(-1)).toEqual(['manish@example.com', 'secret']);
    subscription.unsubscribe();
  });
});
