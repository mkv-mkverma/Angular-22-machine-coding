import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Forms } from './forms';

describe('Forms', () => {
  let component: Forms;
  let fixture: ComponentFixture<Forms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forms],
    }).compileComponents();

    fixture = TestBed.createComponent(Forms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty employee', () => {
    expect(component.employee()).toEqual({ name: '', email: '', password: '' });
  });

  it('is invalid when required fields are empty', () => {
    expect(component.employeeForm().valid()).toBe(false);
  });

  it('is invalid when the name is too short', () => {
    component.employee.set({ name: 'A', email: 'user@example.com', password: 'secret' });

    expect(component.employeeForm().valid()).toBe(false);
  });

  it('is invalid when the name exceeds maxLength(10)', () => {
    component.employee.set({ name: 'A very long name', email: 'user@example.com', password: 'secret' });

    expect(component.employeeForm().valid()).toBe(false);
  });

  it('is invalid when the email is not a valid email', () => {
    component.employee.set({ name: 'Manish', email: 'not-an-email', password: 'secret' });

    expect(component.employeeForm().valid()).toBe(false);
  });

  it('is invalid when the password does not match the letters-only pattern', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret123' });

    expect(component.employeeForm().valid()).toBe(false);
  });

  it('is valid when name, email, and password all satisfy their rules', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret' });

    expect(component.employeeForm().valid()).toBe(true);
  });

  it('does not submit or reset when the form is invalid', () => {
    const event = new SubmitEvent('submit', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.onSubmit(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    // Still whatever the (invalid) values were -- reset() is not called.
    expect(component.employee()).toEqual({ name: '', email: '', password: '' });
  });

  it('resets the employee after a valid submit', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret' });
    const event = new SubmitEvent('submit', { cancelable: true });

    component.onSubmit(event);

    expect(component.employee()).toEqual({ name: '', email: '', password: '' });
  });

  it('reset() clears the employee back to blank fields', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret' });

    component.reset();

    expect(component.employee()).toEqual({ name: '', email: '', password: '' });
  });

  it('disables the submit button while the form is invalid', () => {
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('enables the submit button once the form becomes valid', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret' });
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);
  });

  it('clears the rendered inputs after a valid submit through the DOM', () => {
    component.employee.set({ name: 'Manish', email: 'user@example.com', password: 'secret' });
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(component.employee()).toEqual({ name: '', email: '', password: '' });
  });
});
