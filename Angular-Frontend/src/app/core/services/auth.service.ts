import { Injectable, inject } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserService = inject(CurrentUserService);
  private users: User[] = users;

  private credentials: {
    userId: string;
    password: string;
  }[] = credentials;

  private currentUser: User | null = null;

  login(request: LoginRequest): ApiResponse<AuthResponse> {

    const credential = this.credentials.find(
      (item) =>
        item.userId === request.identifier ||
        this.findUserById(item.userId)?.email === request.identifier
    );

    if (!credential || credential.password !== request.password) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email, user ID, or password.'
        }
      };
    }

    const user = this.findUserById(credential.userId);

    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User could not be found.'
        }
      };
    }

    this.currentUser = user;
    this.currentUserService.setUser(user);

    // Save the logged-in user in the browser for route protection.
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return {
      success: true,
      data: {
        user,
        token: `mock-token-${user.id}`
      }
    };
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
