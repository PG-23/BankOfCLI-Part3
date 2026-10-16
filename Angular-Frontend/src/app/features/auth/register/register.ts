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

  // Terms and policy state
  termsAccepted = false;
  termsError = false;
  activePolicy: 'terms' | 'privacy' | null = null;

  // Username success popup
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

    if (this.password.length < 4) {
      this.errorMessage = 'Password must be at least 4 characters.';
      return;
    }

    if (!/[A-Z]/.test(this.password)) {
      this.errorMessage =
        'Password must contain at least one uppercase letter.';
      return;
    }

    if (!/[a-z]/.test(this.password)) {
      this.errorMessage =
        'Password must contain at least one lowercase letter.';
      return;
    }

    if (!/[^A-Za-z0-9]/.test(this.password)) {
      this.errorMessage =
        'Password must contain at least one special character.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Simulate a server request
    this.isLoading = true;

    setTimeout(() => {
      const response = this.authService.register({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
      });

      if (!response.success) {
        this.isLoading = false;
        this.errorMessage =
          response.error?.message ?? 'Unable to create your account.';
        this.cdr.detectChanges();
        return;
      }

      // Make sure the response includes the new user
      if (!response.data) {
        this.isLoading = false;
        this.errorMessage =
          'Account was created, but the username could not be retrieved.';
        this.cdr.detectChanges();
        return;
      }

      // Display the generated username
      this.isLoading = false;
      this.createdUserId = response.data.id;
      this.showUsernamePopup = true;
      this.cdr.detectChanges();
    }, 700);
  }

  // Close the success popup and continue to Login
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