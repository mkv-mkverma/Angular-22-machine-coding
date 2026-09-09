import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/auth';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);

  emailControl = new FormControl('', { nonNullable: true });
  passwordControl = new FormControl('', { nonNullable: true });

  login() {
    // TODO: Implement login logic here
    this.authService.login(this.emailControl.value, this.passwordControl.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      },
      complete: () => console.log('completed'),
    });
  }
  logout() {
    // TODO: Implement logout logic here
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
