export interface DocumentalArea {
  id: number;
  area: string;
  description: string;
  color: string;
  status: boolean;
}

export interface CreateDocumentalAreaPayload {
  area: string;
  description: string;
  color: string;
}

export type UpdateDocumentalAreaPayload = Partial<CreateDocumentalAreaPayload> & { status?: boolean };

export interface DocumentalAreaFormModel {
  area: string;
  description: string;
  color: string;
}
