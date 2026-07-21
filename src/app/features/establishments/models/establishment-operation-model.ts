import { EstablishmentRisk } from './establishment-model';

export interface EstablishmentOperation {
  establishment_id: string;
  risk: EstablishmentRisk;
  risk_factor?: string;
  gia: boolean;
  covia: boolean;
  ria: boolean;
  inactive_factor?: string;
  cameras: number;
  closing_date?: string;
  install_date?: string;
  real_install_date?: string;
}

export interface UpsertEstablishmentOperationPayload {
  risk: EstablishmentRisk;
  risk_factor?: string;
  gia: boolean;
  covia: boolean;
  ria: boolean;
  inactive_factor?: string;
  cameras: number;
  closing_date?: string;
  install_date?: string;
  real_install_date?: string;
}
