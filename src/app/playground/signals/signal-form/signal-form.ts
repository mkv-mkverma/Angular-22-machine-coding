import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';

export interface IUserForm {
  name: string;
  age: number | null;
  email: string;
  password: string;
}

const EMPTY_USER: IUserForm = { name: '', age: null, email: '', password: '' };

// At least one uppercase, one lowercase, one digit and one special character.
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

@Component({
  selector: 'app-signal-form',
  imports: [FormField],
  templateUrl: './signal-form.html',
  styleUrl: './signal-form.scss',
})
export class SignalForm {
  user = signal<IUserForm>({ ...EMPTY_USER });
  submittedUser = signal<IUserForm | null>(null);

  // Each validator carries its own message, so the template just renders
  // field().errors() instead of mapping error kinds to strings.
  userForm = form(this.user, (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 2, { message: 'Name must be at least 2 characters' });
    maxLength(schema.name, 30, { message: 'Name must be at most 30 characters' });
    pattern(schema.name, /^[A-Za-z ]+$/, { message: 'Name can only contain letters and spaces' });

    required(schema.age, { message: 'Age is required' });
    min(schema.age, 18, { message: 'You must be at least 18 years old' });
    max(schema.age, 100, { message: 'Age must be 100 or less' });

    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Enter a valid email address' });

    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 8, { message: 'Password must be at least 8 characters' });
    pattern(schema.password, PASSWORD_PATTERN, {
      message: 'Password needs an uppercase, lowercase, number and special character',
    });
  });

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    // submit() marks every field as touched (so all errors show) and only
    // runs the action when the form is valid.
    await submit(this.userForm, async () => {
      this.submittedUser.set(this.user());
      this.reset();
      return undefined;
    });
  }

  reset(): void {
    this.userForm().reset({ ...EMPTY_USER });
  }
}
