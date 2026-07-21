import { EstablishmentStatus, EstablishmentRisk } from './establishment-model';

export const ESTABLISHMENT_STATUS_LABELS: Record<EstablishmentStatus, string> = {
  [EstablishmentStatus.PROSPECT]: 'Prospecto',
  [EstablishmentStatus.CLIENT]: 'Cliente',
  [EstablishmentStatus.DEACTIVATE]: 'Baja',
};

export const ESTABLISHMENT_RISK_LABELS: Record<EstablishmentRisk, string> = {
  [EstablishmentRisk.LOW]: 'Bajo',
  [EstablishmentRisk.MID]: 'Medio',
  [EstablishmentRisk.HIGH]: 'Alto',
};

export const ESTABLISHMENT_STATUS_OPTIONS: EstablishmentStatus[] = [
  EstablishmentStatus.PROSPECT,
  EstablishmentStatus.CLIENT,
  EstablishmentStatus.DEACTIVATE,
];

export const ESTABLISHMENT_RISK_OPTIONS: EstablishmentRisk[] = [
  EstablishmentRisk.LOW,
  EstablishmentRisk.MID,
  EstablishmentRisk.HIGH,
];
