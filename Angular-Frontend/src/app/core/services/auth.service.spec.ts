import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { AuthService, API_BASE_URL } from './auth.service';
import { CurrentUserService } from './current.user.services';
import { AuthResponse, ApiResponse, LoginRequest } from '../models';

describe('AuthService login', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const mockCurrentUserService = {
    setUser: vi.fn(),
  };

  const loginRequest: LoginRequest = {
    identifier: 'molly.lee@example.com',
    password: '1234',
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

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/' },
        {
          provide: CurrentUserService,
          useValue: mockCurrentUserService,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should send POST /auth/login with the login request', () => {
    let actualResponse: ApiResponse<AuthResponse> | undefined;

    service.login(loginRequest).subscribe((response) => {
      actualResponse = response;
    });

    const request = httpTestingController.expectOne('/api/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginRequest);

    request.flush(successfulResponse);

    expect(actualResponse).toEqual(successfulResponse);
    expect(mockCurrentUserService.setUser).toHaveBeenCalledWith(
      successfulResponse.data!.user
    );
  });

  it('should preserve an INVALID_CREDENTIALS contract error', () => {
    let actualResponse: ApiResponse<AuthResponse> | undefined;

    service.login(loginRequest).subscribe((response) => {
      actualResponse = response;
    });

    const request = httpTestingController.expectOne('/api/auth/login');

    request.flush(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email, user ID, or password.',
        },
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    expect(actualResponse).toEqual({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email, user ID, or password.',
      },
    });
  });
it('should map a plain HTTP 401 to INVALID_CREDENTIALS', () => {
    let actualResponse: ApiResponse<AuthResponse> | undefined;

    service.login(loginRequest).subscribe((response) => {
      actualResponse = response;
    });

    const request = httpTestingController.expectOne('/api/auth/login');

    request.flush(
      { message: 'Unauthorized' },
      {
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    expect(actualResponse).toEqual({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email, user ID, or password.',
      },
    });
  });

 it('should map a plain HTTP 400 to VALIDATION_ERROR', () => {
    let actualResponse: ApiResponse<AuthResponse> | undefined;

    service.login(loginRequest).subscribe((response) => {
      actualResponse = response;
    });

    const request = httpTestingController.expectOne('/api/auth/login');

    request.flush(
      { message: 'Bad request' },
      {
        status: 400,
        statusText: 'Bad Request',
      }
    );

    expect(actualResponse).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the information you entered.',
      },
    });
  });
});
