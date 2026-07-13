import { Routes } from '@angular/router';

export const PLANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans/plans').then((m) => m.Plans),
  },
];
