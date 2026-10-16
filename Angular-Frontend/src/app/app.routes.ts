import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // public pages: no navbar or sidebar
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  // logged-in pages: wrapped in the Shell (navbar + sidebar), guarded once here
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'help',
        loadComponent: () => 
          import('./features/help/help/help').then((m) => m.Help),
      },
      {
        path: 'profile',
        loadComponent: () => 
          import('./features/profile/profile/profile').then((m) => m.Profile),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];