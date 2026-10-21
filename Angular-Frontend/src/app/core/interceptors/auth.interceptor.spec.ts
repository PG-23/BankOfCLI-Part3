import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const authServiceMock = {
    logout: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    authServiceMock.logout.mockClear();
    routerMock.navigate.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('adds a Bearer token to protected requests', () => {
    localStorage.setItem('authToken', 'test-token');

    http.get('/api/accounts').subscribe();

    const request = httpTesting.expectOne('/api/accounts');

    expect(request.request.headers.get('Authorization'))
      .toBe('Bearer test-token');

    request.flush({});
  });

  it('does not attach a token to authentication requests', () => {
    localStorage.setItem('authToken', 'test-token');

    http.post('/api/auth/login', {
      identifier: 'user@example.com',
      password: 'password',
    }).subscribe();

    const request = httpTesting.expectOne('/api/auth/login');

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush({});
  });

  it('clears the session and redirects after a protected request returns 401', () => {
    localStorage.setItem('authToken', 'expired-token');

    http.get('/api/accounts').subscribe({
      error: () => {},
    });

    const request = httpTesting.expectOne('/api/accounts');

    request.flush(
      { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not log out when login returns 401', () => {
    localStorage.setItem('authToken', 'old-token');

    http.post('/api/auth/login', {
      identifier: 'user@example.com',
      password: 'wrong-password',
    }).subscribe({
      error: () => {},
    });

    const request = httpTesting.expectOne('/api/auth/login');

    request.flush(
      { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
