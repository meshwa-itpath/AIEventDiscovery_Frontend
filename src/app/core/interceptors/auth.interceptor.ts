import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

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

  // Pass the cloned request to the next handler and catch any errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If the error is 401 Unauthorized, redirect to the login page
      if (error.status === 401) {
        // You might want to clear the session storage here as well
        sessionStorage.removeItem('token');
        router.navigate(['/login']); // Assuming '/login' is the route to your login page
      }
      return throwError(() => error);
    })
  );
};
