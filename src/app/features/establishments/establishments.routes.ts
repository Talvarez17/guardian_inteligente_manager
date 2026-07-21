import { Routes } from '@angular/router';

export const ESTABLISHMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/establishments/establishments').then((m) => m.Establishments),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/establishment-wizard/establishment-wizard').then((m) => m.EstablishmentWizard),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/establishment-wizard/establishment-wizard').then((m) => m.EstablishmentWizard),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/establishment-detail/establishment-detail').then((m) => m.EstablishmentDetail),
  },
];
