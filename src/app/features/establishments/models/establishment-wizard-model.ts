import { EstablishmentRisk, EstablishmentStatus } from './establishment-model';
import { ChecklistItemType } from './establishment-checklist-model';

export type StepId = 'general' | 'contacto' | 'operacion' | 'facturacion' | 'checklist';

export interface CoreModel {
  name: string;
  business_name: string;
  rfc: string;
  turnover_id: number;
  street: string;
  neighborhood: string;
  ext_number: string;
  int_number: string;
  postal_code: string;
  state: string;
  city: string;
  designated_person_id: string;
  plan_id: number;
  establishment_status: EstablishmentStatus;
  comment: string;
}

export interface ContactModel {
  contact_role_id: number;
  contact_name: string;
  contact_number: string;
  contact_email: string;
}

export interface OperationModel {
  risk: EstablishmentRisk;
  risk_factor: string;
  gia: boolean;
  covia: boolean;
  ria: boolean;
  inactive_factor: string;
  cameras: number;
  closing_date: string;
  install_date: string;
  real_install_date: string;
}

export interface BillingModel {
  monthly_bill: number;
  payment_method_id: number;
  payment_form_id: number;
}

export interface ChecklistRowState {
  item_type: ChecklistItemType;
  completed: boolean;
  document_url: string | null;
  file: File | null;
  saving: boolean;
  error: string | null;
}
