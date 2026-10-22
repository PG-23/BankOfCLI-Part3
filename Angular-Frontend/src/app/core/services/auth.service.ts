import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  AuthResponse,
  ApiResponse
} from '../models';
import { toApiResponse } from '../utils/api-result';
import { CurrentUserService } from './current.user.services';

const TOKEN_KEY = 'authToken'; // must match auth.interceptor.ts

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private currentUserService = inject(CurrentUserService);
  private api = environment.apiUrl;

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return toApiResponse(
      this.http.post<AuthResponse>(`${this.api}/auth/login`, {
        // usernames n emails are stored lowercase!
        identifier: request.identifier.trim().toLowerCase(),
        password: request.password,
      }),
    ).pipe(
      tap((response) => {
        if(response.success && response.data) {
          this.startSession(response.data);
        }
      }),
    );
  }

  // the backend also creats the users $0 account
  // we dont log in here: the page shows the new username, then sends the user to login
  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return toApiResponse(
      this.http.post<AuthResponse>(`${this.api}/auth/register`, request),
    );
  }

  // the backend has no profile endpoint, so changes only live in this browser only
  updateProfile(userId: string, changes: UpdateProfileRequest): ApiResponse<User> {
    const user = this.getCurrentUser();

    if (!user || user.id !== userId) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User could not be found.' }
      };
    }

    const firstName = changes.firstName.trim();
    const lastName = changes.lastName.trim();
    const email = changes.email.trim();

    if (!firstName || !lastName || !email) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'First name, last name and email are required.' }
      };
    }

    const updated: User = {
      ...user,
      firstName,
      lastName,
      email,
      ...(changes.gender ? { gender: changes.gender } : {})
    };

    this.currentUserService.setUser(updated);
    return { success: true, data: updated };
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserService.user();
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUserService.setUser(null);
  }

  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private startSession(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.token);
    }
    this.currentUserService.setUser(response.user);
  }
}