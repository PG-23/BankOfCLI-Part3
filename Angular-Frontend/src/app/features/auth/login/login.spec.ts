
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse, ApiResponse } from '../../../core/models';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const mockAuthService = {
    login: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  const successfulResponse: ApiResponse<AuthResponse> = {
    success: true,
    data: {
      user: {
        id: 'ML1001',
        firstName: 'Molly',
        lastName: 'Lee',
        email: 'molly.lee@example.com',
      },
      token: 'mock-token-ML1001',
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log in successfully and navigate to dashboard', () => {
    mockAuthService.login.mockReturnValue(of(successfulResponse));

    component.identifier = 'molly.lee@example.com';
    component.password = '1234';

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      identifier: 'molly.lee@example.com',
      password: '1234',
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('should display invalid credentials errors', () => {
    mockAuthService.login.mockReturnValue(
      of({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email, user ID, or password.',
        },
      })
    );

    component.identifier = 'wrong@example.com';
    component.password = 'wrong-password';

    component.onLogin();

    expect(component.errorMessage).toBe(
      'Invalid email, user ID, or password.'
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should display validation errors', () => {
    mockAuthService.login.mockReturnValue(
      of({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the information you entered.',
        },
      })
    );

    component.identifier = 'not-an-email';
    component.password = '1234';

    component.onLogin();

    expect(component.errorMessage).toBe(
      'Please check the information you entered.'
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should display a friendly message when the request fails', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('Network unavailable'))
    );

    component.identifier = 'molly.lee@example.com';
    component.password = '1234';

    component.onLogin();

    expect(component.errorMessage).toBe(
      'Unable to log in right now. Please try again.'
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should reject empty fields without calling the service', () => {
    component.identifier = ' ';
    component.password = '';

    component.onLogin();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe(
      'Please enter your email or user ID and password.'
    );
    expect(component.isLoading).toBe(false);
  });
});
