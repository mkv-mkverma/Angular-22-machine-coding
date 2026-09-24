import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IUserForm, SignalForm } from './signal-form';

const VALID_USER: IUserForm = {
  name: 'Manish',
  age: 30,
  email: 'user@example.com',
  password: 'Secret@123',
};

describe('SignalForm', () => {
  let component: SignalForm;
  let fixture: ComponentFixture<SignalForm>;

  const errorMessages = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.error')).map((el) =>
      (el as HTMLElement).textContent!.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid initially but shows no errors until fields are touched', () => {
    fixture.detectChanges();

    expect(component.userForm().valid()).toBe(false);
    expect(errorMessages()).toEqual([]);
  });

  it('is valid when every field satisfies its rules', () => {
    component.user.set(VALID_USER);

    expect(component.userForm().valid()).toBe(true);
  });

  it.each([
    ['name', 'A', 'Name must be at least 2 characters'],
    ['name', 'John123', 'Name can only contain letters and spaces'],
    ['age', 12, 'You must be at least 18 years old'],
    ['age', 150, 'Age must be 100 or less'],
    ['email', 'not-an-email', 'Enter a valid email address'],
    ['password', 'Short1!', 'Password must be at least 8 characters'],
    ['password', 'password123', 'Password needs an uppercase, lowercase, number and special character'],
  ] as const)('reports "%s" = %s with message "%s"', (field, value, message) => {
    component.user.set({ ...VALID_USER, [field]: value });

    const messages = component.userForm[field]()
      .errors()
      .map((e) => e.message);
    expect(messages).toContain(message);
  });

  it('shows required messages for every field after an empty submit', async () => {
    await component.onSubmit(new SubmitEvent('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(errorMessages()).toEqual(
      expect.arrayContaining([
        'Name is required',
        'Age is required',
        'Email is required',
        'Password is required',
      ]),
    );
    expect(component.submittedUser()).toBeNull();
  });

  it('shows an error once a field is touched with an invalid value', () => {
    component.user.set({ ...VALID_USER, email: 'bad' });
    component.userForm.email().markAsTouched();
    fixture.detectChanges();

    expect(errorMessages()).toEqual(['Enter a valid email address']);
  });

  it('submits a valid form and resets it', async () => {
    component.user.set(VALID_USER);

    await component.onSubmit(new SubmitEvent('submit', { cancelable: true }));

    expect(component.submittedUser()).toEqual(VALID_USER);
    expect(component.user()).toEqual({ name: '', age: null, email: '', password: '' });
    expect(component.userForm().touched()).toBe(false);
  });
});
