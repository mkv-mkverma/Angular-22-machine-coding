import { Component, signal } from '@angular/core';
import { email, form, FormField, maxLength, minLength, pattern, required } from '@angular/forms/signals';

export interface IEmployee {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-forms',
  imports: [FormField],
  templateUrl: './forms.html',
  styleUrl: './forms.scss',
})
export class Forms {
  employee = signal<IEmployee>({
    name: '',
    email: '',
    password: '',
  });

  employeeForm = form(this.employee, (schema) => {
    required(schema.name);
    required(schema.email);
    required(schema.password);
    minLength(schema.name, 2);
    maxLength(schema.name, 10);
    email(schema.email);
    pattern(schema.password, /^[A-Za-z ]+$/);
  });

  onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!this.employeeForm().valid()) return;

    console.log(this.employeeForm());
    console.log(this.employee());

    this.reset();
  }

  reset() {
    this.employee.set({
      name: '',
      email: '',
      password: '',
    });
  }
}
