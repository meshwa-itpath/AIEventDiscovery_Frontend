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
    // Shell layout for main authenticated pages
    path: '',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./pages/event-detail/event-detail.component').then(m => m.EventDetailComponent)
      }
    ]
  },
  {
    // Profile is outside the shell (has its own layout/nav if any)
    path: 'profile',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/update-profile/update-profile.component').then(m => m.UpdateProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
