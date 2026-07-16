import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: ''
  }
];

