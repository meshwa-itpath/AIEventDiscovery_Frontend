import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  // Retrieve the token from sessionStorage
  const token = sessionStorage.getItem('token');

  // Clone the request to add the authentication header
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  loadingService.show();

  // Pass the cloned request to the next handler and catch any errors
  return next(authReq).pipe(
    finalize(() => loadingService.hide()),
    catchError((error: HttpErrorResponse) => {
      // If the error is 401 Unauthorized, redirect to the login page
      if (error.status === 401) {
        // Clear all session data so stale flags (e.g. isOnBoardingCompleted) don't linger
        sessionStorage.clear();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
