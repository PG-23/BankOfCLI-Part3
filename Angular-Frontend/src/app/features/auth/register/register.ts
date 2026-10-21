import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  errorMessage = '';
  isLoading = false;

  // terms n policy state
  termsAccepted = false;
  termsError = false;
  activePolicy: 'terms' | 'privacy' | null = null;

  // username success popup
  createdUserId = '';
  showUsernamePopup = false;

  onRegister(): void {
    this.errorMessage = '';
    this.termsError = false;

    if (!this.firstName.trim()) {
      this.errorMessage = 'First name is required.';
      return;
    }

    if (!this.lastName.trim()) {
      this.errorMessage = 'Last name is required.';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password.';
      return;
    }

    if (!this.termsAccepted) {
      this.termsError = true;
      return;
    }

    if (!this.isValidName(this.firstName.trim())) {
      this.errorMessage = 'First name can only contain letters.';
      return;
    }

    if (!this.isValidName(this.lastName.trim())) {
      this.errorMessage = 'Last name can only contain letters.';
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // same rule as the backend: at least 8 characters, including a number
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (!/\d/.test(this.password)) {
      this.errorMessage = 'Password must contain at least one number.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe((response) => {
        this.isLoading = false;

        if (!response.success || !response.data) {
          this.errorMessage =
            response.error?.message ?? 'Unable to create your account.';
          this.cdr.detectChanges();
          return;
        }

        // display the username the backend generated, ex: "jdoe4821"
        this.createdUserId = response.data.user.username;
        this.showUsernamePopup = true;
        this.cdr.detectChanges();
      });
  }

  // close the success popup and continue to login
  continueToLogin(): void {
    this.showUsernamePopup = false;
    this.router.navigate(['/login']);
  }

  openTerms(event: Event): void {
    event.preventDefault();
    this.activePolicy = 'terms';
  }

  openPrivacy(event: Event): void {
    event.preventDefault();
    this.activePolicy = 'privacy';
  }

  closePolicy(): void {
    this.activePolicy = null;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private isValidName(name: string): boolean {
    return /^[A-Za-z]+$/.test(name);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}