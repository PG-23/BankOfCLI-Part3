import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const TOKEN_KEY = 'authToken';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRequest = request.url.includes('/auth/');

  let token: string | null = null;

  // localStorage exists only in the browser, not during server rendering.
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(TOKEN_KEY);
  }

  // Authentication endpoints must not receive an old bearer token.
  const outgoingRequest =
    !isAuthRequest && token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(outgoingRequest).pipe(
    catchError((error: unknown) => {
      // A login failure should be shown on the login page, not treated
      // as an expired session.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRequest
      ) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }

        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
