export enum EstablishmentStatus {
  PROSPECT = 'prospect',
  CLIENT = 'client',
  DEACTIVATE = 'deactivate',
}

export enum EstablishmentRisk {
  LOW = 'low',
  MID = 'mid',
  HIGH = 'high',
}

export interface Turnover {
  id: number;
  name: string;
  status: boolean;
}

export interface Plan {
  id: number;
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  trial: number;
  tries: number;
  comments: string;
  status: boolean;
}

export interface DesignatedPerson {
  id: string;
  name: string;
  first_last_name: string;
  second_last_name?: string;
  email: string;
}

export interface Establishment {
  id: string;
  name: string;
  business_name: string;
  rfc: string;
  turnover: Turnover;
  street: string;
  neighborhood: string;
  ext_number: string;
  int_number?: string;
  postal_code: string;
  state: string;
  city: string;
  designated_person: DesignatedPerson;
  plan: Plan;
  establishment_status: EstablishmentStatus;
  comment?: string;
  active: boolean;
}

export interface CreateEstablishmentPayload {
  name: string;
  business_name: string;
  rfc: string;
  turnover_id: number;
  street: string;
  neighborhood: string;
  ext_number: string;
  int_number?: string;
  postal_code: string;
  state: string;
  city: string;
  designated_person_id: string;
  plan_id: number;
  establishment_status?: EstablishmentStatus;
  comment?: string;
}

export type UpdateEstablishmentPayload = Partial<CreateEstablishmentPayload>;
