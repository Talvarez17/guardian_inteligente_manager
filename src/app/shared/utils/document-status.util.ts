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

export function documentStatusBadgeClass(status: DocumentComputedStatus): string {
  switch (status) {
    case 'vigente':
      return 'badge-success';
    case 'por-vencer':
      return 'badge-warning';
    case 'vencido':
      return 'badge-error';
  }
}
