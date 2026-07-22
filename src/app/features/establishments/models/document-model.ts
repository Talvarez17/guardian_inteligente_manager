import { DocumentalArea } from '../../management/models/documental-area-model';

export interface Document {
  id: number;
  name: string;
  area: DocumentalArea;
  status: boolean;
  version: string;
  expiration_date: string;
  url: string;
  comments?: string;
}

export interface CreateDocumentPayload {
  establishment_id: string;
  name: string;
  area_id: number;
  version: string;
  expiration_date: string;
  comments?: string;
}

export type UpdateDocumentPayload = Partial<Omit<CreateDocumentPayload, 'establishment_id'>>;

export interface DocumentFormModel {
  name: string;
  area_id: string;
  version: string;
  expiration_date: string;
  comments: string;
}

export type DocumentComputedStatus = 'vigente' | 'por-vencer' | 'vencido';
