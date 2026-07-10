import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
