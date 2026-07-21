export interface ClientRole {
  id: number;
  name: string;
  status: boolean;
}

export interface EstablishmentContact {
  establishment_id: string;
  contact_role: ClientRole;
  contact_name: string;
  contact_number: string;
  contact_email: string;
}

export interface UpsertEstablishmentContactPayload {
  contact_role_id: number;
  contact_name: string;
  contact_number: string;
  contact_email: string;
}
