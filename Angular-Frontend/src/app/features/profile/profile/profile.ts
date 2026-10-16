import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentUserService } from '../../../core/services/current.user.services';
import { Gender } from '../../../core/models';

function emailsMatch(group: AbstractControl): ValidationErrors | null {
  const email = String(group.get('email')?.value ?? '').trim().toLowerCase();
  const confirm = String(group.get('confirmEmail')?.value ?? '').trim().toLowerCase();
  return email === confirm ? null : { emailMismatch: true };
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private currentUser = inject(CurrentUserService);

  readonly user = this.currentUser.user;
  readonly fullName = this.currentUser.fullName;

  saving = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly genders: { value: Gender; label: string }[] = [
    { value: 'MALE', label: 'male' },
    { value: 'FEMALE', label: 'female' },
    { value: 'NON_BINARY', label: 'non-binary' },
  ];

  private emailRule = Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, this.emailRule]],
      confirmEmail: ['', [Validators.required, this.emailRule]],
      gender: [''],
    },
    { validators: [emailsMatch] },
  );

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;

    this.form.reset({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      confirmEmail: u.email,
      gender: u.gender ?? '',
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const u = this.user();
    if (!u) return;

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.feedback.set(null);

    // short delay so the loading state is visible, like a real server call
    setTimeout(() => {
      const res = this.auth.updateProfile(u.id, {
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        gender: v.gender ? (v.gender as Gender) : undefined,
      });

      this.saving.set(false);

      if (res.success) {
        this.feedback.set({ type: 'success', text: 'Profile updated.' });
        this.form.markAsPristine();
      } else {
        this.feedback.set({ type: 'error', text: res.error?.message ?? 'Could not save your changes.' });
      }
    }, 600);
  }

  invalid(name: 'firstName' | 'lastName' | 'email' | 'confirmEmail'): boolean {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }
}