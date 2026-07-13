import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'establecimientos',
        loadChildren: () => import('./features/establishments/establishments.routes').then((m) => m.ESTABLISHMENTS_ROUTES),
      },
      {
        path: 'planes',
        loadChildren: () => import('./features/plans/plans.routes').then((m) => m.PLANS_ROUTES),
      },
      {
        path: 'cobranza',
        loadChildren: () => import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'gestion',
        loadChildren: () => import('./features/management/management.routes').then((m) => m.MANAGEMENT_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
