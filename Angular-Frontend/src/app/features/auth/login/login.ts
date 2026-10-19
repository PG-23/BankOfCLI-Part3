import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  identifier = '';
  password = '';

  errorMessage = '';
  isLoading = false;
  showPassword = signal(false);

  onLogin(): void {
    this.errorMessage = '';

    if (!this.identifier.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your email or user ID and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      identifier: this.identifier.trim(),
      password: this.password,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (!response.success || !response.data) {
          this.errorMessage =
            response.error?.message ?? 'Unable to log in.';
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage =
          'Unable to log in right now. Please try again.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
