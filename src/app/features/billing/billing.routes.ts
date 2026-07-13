import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/billing/billing').then((m) => m.Billing),
  },
];
