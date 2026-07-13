import { EstablishmentStatus, EstablishmentRisk } from './establishment-model';

export const BUSINESS_TYPE_OPTIONS: string[] = [
  'Bar',
  'Restaurante',
  'Antro',
  'Clínica',
  'Salón de eventos',
  'Casino',
  'Gimnasio',
  'Otro',
];

export const MANAGER_OPTIONS: string[] = ['Mariana Torres', 'Carlos Medina', 'Ana Fernández', 'Diego Salinas'];

export const PACKAGE_OPTIONS: string[] = ['Bienvenida', 'Bienvenida Plus', 'Premium', 'Empresarial'];

export const STATUS_OPTIONS: EstablishmentStatus[] = ['Prospecto', 'Activo', 'Baja'];

export const RISK_OPTIONS: EstablishmentRisk[] = ['Bajo', 'Medio', 'Alto'];
