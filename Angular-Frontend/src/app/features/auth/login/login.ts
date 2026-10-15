import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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

    // Simulate a short server response delay.
    setTimeout(() => {
      const response = this.authService.login({
        identifier: this.identifier.trim(),
        password: this.password,
      });

      if (!response.success) {
        this.isLoading = false;
        this.errorMessage =
          response.error?.message ?? 'Unable to log in.';

        this.cdr.detectChanges();
        return;
      }

      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 700);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}