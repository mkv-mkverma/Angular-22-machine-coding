import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('falls back to an empty string when the email stream errors', () => {
    const emailValues: (string | null)[] = [];
    component.email$.subscribe((v) => emailValues.push(v));

    (component.emailControl.valueChanges as unknown as Subject<string | null>).error(
      new Error('boom'),
    );

    expect(emailValues.at(-1)).toBe('');
  });

  it('falls back to an empty string when the password stream errors', () => {
    const passwordValues: (string | null)[] = [];
    component.password$.subscribe((v) => passwordValues.push(v));

    (component.passwordControl.valueChanges as unknown as Subject<string | null>).error(
      new Error('boom'),
    );

    expect(passwordValues.at(-1)).toBe('');
  });

  it('logs "Completed" once both email and password streams complete', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    (component.emailControl.valueChanges as unknown as Subject<string | null>).complete();
    (component.passwordControl.valueChanges as unknown as Subject<string | null>).complete();

    expect(logSpy).toHaveBeenCalledWith('Completed');
  });
});
