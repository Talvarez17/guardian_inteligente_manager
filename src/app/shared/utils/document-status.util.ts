import { DocumentComputedStatus } from '../../features/establishments/models/document-model';

export const DOCUMENT_DUE_SOON_THRESHOLD_DAYS = 30;

export function computeDocumentStatus(expirationDate: string): DocumentComputedStatus {
  const daysUntilExpiration = (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiration < 0) return 'vencido';
  if (daysUntilExpiration <= DOCUMENT_DUE_SOON_THRESHOLD_DAYS) return 'por-vencer';
  return 'vigente';
}

export function documentStatusLabel(status: DocumentComputedStatus): string {
  switch (status) {
    case 'vigente':
      return 'Vigente';
    case 'por-vencer':
      return 'Por vencer';
    case 'vencido':
      return 'Vencido';
  }
}

export function documentStatusAccentClass(status: DocumentComputedStatus): string {
  switch (status) {
    case 'vigente':
      return 'border-l-success';
    case 'por-vencer':
      return 'border-l-warning';
    case 'vencido':
      return 'border-l-error';
  }
}

export function documentStatusAvatarClass(status: DocumentComputedStatus): string {
  switch (status) {
    case 'vigente':
      return 'bg-success/15 text-success';
    case 'por-vencer':
      return 'bg-warning/15 text-warning';
    case 'vencido':
      return 'bg-error/15 text-error';
  }
}

export function documentStatusTextClass(status: DocumentComputedStatus): string {
  switch (status) {
    case 'vigente':
      return 'text-success';
    case 'por-vencer':
      return 'text-warning';
    case 'vencido':
      return 'text-error';
  }
}
