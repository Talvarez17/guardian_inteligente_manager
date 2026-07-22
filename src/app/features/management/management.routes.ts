import { Routes } from '@angular/router';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/management/management').then((m) => m.Management),
  },
  {
    path: 'catalogos/:catalogId',
    loadComponent: () => import('./pages/catalog-list/catalog-list').then((m) => m.CatalogList),
  },
  {
    path: 'areas-documentales',
    loadComponent: () => import('./pages/documental-areas/documental-areas').then((m) => m.DocumentalAreas),
  },
  {
    path: 'tipos-documento',
    loadComponent: () => import('./pages/document-types/document-types').then((m) => m.DocumentTypes),
  },
];
