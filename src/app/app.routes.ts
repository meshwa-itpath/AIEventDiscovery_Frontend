import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    // Must be authenticated, but onboarding NOT yet required (it's the onboarding step itself)
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    // Must be authenticated AND have completed onboarding
    path: 'search',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
  },
  {
    // Must be authenticated AND have completed onboarding
    path: 'profile',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/update-profile/update-profile.component').then(m => m.UpdateProfileComponent)
  },
  {
    // Must be authenticated AND have completed onboarding
    path: 'events/:id',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

