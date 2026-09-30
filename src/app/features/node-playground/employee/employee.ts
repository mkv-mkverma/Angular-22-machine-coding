import { Component, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { EmployeeService, IEmployee } from '../employee-service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { email, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';

export const FORMENTITY = {
  name: '',
  email: '',
};

@Component({
  selector: 'app-employee',
  imports: [FormField],
  templateUrl: './employee.html',
  styleUrl: './employee.scss',
})
export class Employee {
  private readonly employeeService = inject(EmployeeService);
  private destroyRef = inject(DestroyRef);
  employee = signal({ ...FORMENTITY });
  editId = signal<number | null>(null);

  employeeForm = form(this.employee, (schema) => {
    required(schema.name);
    minLength(schema.name, 2);
    maxLength(schema.name, 15);
    required(schema.email);
    email(schema.email);
  });

  onSubmit(e: Event) {
    e.preventDefault();
    if (this.employeeForm().invalid()) return;

    this.handleEmpAdd(this.employeeForm().value().name, this.employeeForm().value().email);
  }

  reset() {
    this.employeeForm().reset({ ...FORMENTITY });
  }

  employeesFromAPI = toSignal(this.employeeService.getEmployees().pipe(map((res) => res.data)), {
    initialValue: [],
  });

  employees = linkedSignal(() => this.employeesFromAPI());

  handleEmpAdd(name: string, email: string) {
    this.employeeService
      .addEmployee(name, email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!data.success) {
            return;
          }
          const emp = data.data;
          this.employees.update((p) => [...p, emp]);
          this.reset();
        },
        error: (e) => console.log(e),
      });
  }

  handleEmpEdit(emp: IEmployee) {
    this.editId.set(emp.id);
    this.employee.set({ name: emp.name, email: emp.email });
  }

  handleEmpUpdate(e: Event) {
    e.preventDefault();
    const id = this.editId();
    if (id === null) {
      return;
    }
    const emp: IEmployee = {
      id,
      name: this.employee().name,
      email: this.employee().email,
    };
    this.employeeService
      .updateEmployee(emp)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!data.success) {
            return;
          }

          this.employees.update((p) =>
            p.map((item) =>
              item.id === emp.id ? { ...item, name: emp.name, email: emp.email } : item,
            ),
          );

          this.editId.set(null);
          this.reset();
        },
        error: (err) => console.log(err),
      });
  }

  handleEmpDelete(id: number) {
    this.employeeService
      .deleteEmployee(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!data.success) {
            return;
          }
          this.employees.update((p) => p.filter((item) => item.id !== id));
        },
        error: (err) => console.log(err),
      });
  }
}
