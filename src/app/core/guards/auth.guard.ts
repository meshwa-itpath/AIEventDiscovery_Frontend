import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Protects routes that require an authenticated session.
 * Reads the JWT token from sessionStorage.
 * Redirects to /auth/login if no token is found.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
