import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Protects routes that require onboarding to be completed.
 * Reads the 'isOnBoardingCompleted' flag stored in sessionStorage at login time
 * (set by login.component.ts and updated by onboarding.component.ts).
 * Redirects to /onboarding if the flag is not 'true'.
 */
export const onboardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isOnBoardingCompleted = sessionStorage.getItem('isOnBoardingCompleted');

  if (isOnBoardingCompleted !== 'true') {
    router.navigate(['/onboarding']);
    return false;
  }

  return true;
};
