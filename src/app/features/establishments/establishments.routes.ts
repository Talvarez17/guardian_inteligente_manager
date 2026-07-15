import { Routes } from '@angular/router';

export const ESTABLISHMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/establishments/establishments').then((m) => m.Establishments),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/establishment-form/establishment-form').then((m) => m.EstablishmentForm),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/establishment-form/establishment-form').then((m) => m.EstablishmentForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/establishment-detail/establishment-detail').then((m) => m.EstablishmentDetail),
  },
];
