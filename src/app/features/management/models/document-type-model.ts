export interface DocumentType {
  id: number;
  name: string;
  category_id: number;
  validity: number;
  status: boolean;
}

export interface CreateDocumentTypePayload {
  name: string;
  category_id: number;
  validity: number;
}

export type UpdateDocumentTypePayload = Partial<CreateDocumentTypePayload> & { status?: boolean };

export interface DocumentTypeFormModel {
  name: string;
  category_id: string;
  validity: number;
}
