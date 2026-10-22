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
      this.errorMessage = 'Please enter your email or username and password.';
      return;
    }

    this.isLoading = true;

    this.authService
      .login({
        identifier: this.identifier,
        password: this.password,
      })
      .subscribe((response) => {
        this.isLoading = false;

        if (!response.success) {
          this.errorMessage =
            response.error?.message ?? 'Unable to log in.';

          this.cdr.detectChanges();
          return;
        }

        this.router.navigate(['/dashboard']);
      });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}