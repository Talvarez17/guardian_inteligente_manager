export interface ExpirationModel {
  title: string;
  entity: string;
  establishmentId: string;
  date: string;
  type: string;
  status: 'Vigente' | 'Por vencer';
  ext: 'PDF' | 'XLSX' | 'DOCX';
}
