import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserManagementService } from '../service/user-management';

@Component({
  selector: 'app-add-user',
  imports: [FormsModule, RouterLink],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {
  private router = inject(Router);
  private userManagementService = inject(UserManagementService);
  firstName = signal('');
  lastName = signal('');
  age = signal('');

  onSubmit() {
    console.log(this.firstName(), this.lastName(), this.age());
    this.userManagementService
      .createUser({
        firstName: this.firstName(),
        lastName: this.lastName(),
        age: +this.age(),
      })
      .subscribe({
        next: (d) => console.log(d),
      });
    this.router.navigate(['/user', 2], {
      // user can't go back
      replaceUrl: true,
    });
  }
}
