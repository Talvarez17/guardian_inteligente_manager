export type DocumentArea = 'Fiscal' | 'Legal' | 'Operativo' | 'Administrativo';
export type DocumentStatus = 'Vigente' | 'Por vencer' | 'Vencido';

export interface DocumentModel {
  id: string;
  establishmentId: string;
  name: string;
  area: DocumentArea;
  version: string;
  status: DocumentStatus;
  expirationDate: string;
  notes: string;
  fileName: string;
}
