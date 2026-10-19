import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,   // NEW
  AuthResponse,
  ApiResponse
} from '../models';
import users from '../mock/users.json';
import credentials from '../mock/credentials.json';
import { CurrentUserService } from './current.user.services';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  private currentUserService = inject(CurrentUserService);
  private users: User[] = users;

  private credentials: {
    userId: string;
    password: string;
  }[] = credentials;

  private currentUser: User | null = null;

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    const baseUrl = this.apiBaseUrl.replace(/\/+$/, '');
    const url = `${baseUrl}/auth/login`;

    return this.http
      .post<ApiResponse<AuthResponse>>(url, request)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            const user = response.data.user;

            this.currentUser = user;
            this.currentUserService.setUser(user);

            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
          }

          return response;
        }),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            const body = error.error as {
              success?: boolean;
              error?: {
                code?: string;
                message?: string;
              };
            } | null;

            // Preserve an error returned in the agreed API envelope.
            if (
              body?.success === false &&
              body.error?.code &&
              body.error.message
            ) {
              return of({
                success: false,
                error: {
                  code: body.error.code as ApiResponse<AuthResponse>['error'] extends infer E
                    ? E extends { code: infer C } ? C : never
                    : never,
                  message: body.error.message,
                },
              });
            }

            // Translate common HTTP errors into the frontend contract.
            if (error.status === 400) {
              return of({
                success: false,
                error: {
                  code: 'VALIDATION_ERROR' as const,
                  message: 'Please check the information you entered.',
                },
              });
            }

            if (error.status === 401) {
              return of({
                success: false,
                error: {
                  code: 'INVALID_CREDENTIALS' as const,
                  message: 'Invalid email, user ID, or password.',
                },
              });
            }
          }

          // Let the login page show a generic message for network/server failures.
          return throwError(() => error);
        })
      );
  }
  register(request: RegisterRequest): ApiResponse<User> {

    const emailExists = this.users.some(
      (user) => user.email.toLowerCase() === request.email.toLowerCase()
    );

    if (emailExists) {
      return {
        success: false,
        error: {
          code: 'EMAIL_ALREADY_TAKEN',
          message: 'An account with this email already exists.'
        }
      };
    }

    const newUserId = this.generateUserId(
      request.firstName,
      request.lastName
    );

    const newUser: User = {
      id: newUserId,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email
    };

    this.users.push(newUser);

    this.credentials.push({
      userId: newUserId,
      password: request.password
    });

    return {
      success: true,
      data: newUser
    };
  }

  // NEW: used by the profile page
  updateProfile(userId: string, changes: UpdateProfileRequest): ApiResponse<User> {

    const index = this.users.findIndex((user) => user.id === userId);

    if (index === -1) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User could not be found.'
        }
      };
    }

    const firstName = changes.firstName.trim();
    const lastName = changes.lastName.trim();
    const email = changes.email.trim();

    if (!firstName || !lastName || !email) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'First name, last name and email are required.'
        }
      };
    }

    const emailTaken = this.users.some(
      (user) =>
        user.id !== userId &&
        user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailTaken) {
      return {
        success: false,
        error: {
          code: 'EMAIL_ALREADY_TAKEN',
          message: 'An account with this email already exists.'
        }
      };
    }

    const updated: User = {
      ...this.users[index],
      firstName,
      lastName,
      email,
      ...(changes.gender ? { gender: changes.gender } : {})
    };

    this.users[index] = updated;
    this.currentUser = updated;
    this.currentUserService.setUser(updated); // navbar and welcome cards update immediately

    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }

    return {
      success: true,
      data: updated
    };
  }

  getCurrentUser(): User | null {

    if (this.currentUser) {
      return this.currentUser;
    }

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }

    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    this.currentUserService.setUser(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }

  private findUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }


  private generateUserId(
    firstName: string,
    lastName: string
  ): string {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    // Find the highest four-digit ID sequence already used.
    const existingNumbers = this.users
      .map((user) => user.id.match(/^[A-Z]{2}(\d{4})$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => Number(match[1]));

    const nextNumber = Math.max(0, ...existingNumbers) + 1;
    const sequence = String(nextNumber).padStart(4, '0');

    return `${firstInitial}${lastInitial}${sequence}`;
  }
}
