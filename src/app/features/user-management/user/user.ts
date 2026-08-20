import { Component, inject, input, output } from '@angular/core';
import { IUsers } from '../models/usersManagement';
import { RouterLink } from '@angular/router';
import { UserManagementService } from '../service/user-management';

@Component({
  selector: 'app-user',
  imports: [RouterLink],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {
  private userManagementService = inject(UserManagementService);
  user = input.required<IUsers>();

  

  deleted = output<number>();

  delete(userId: number) {
    this.userManagementService.deleteUser(userId).subscribe({
      next: () => this.deleted.emit(userId),
      error: (e) => console.error(e),
    });
  }
}
