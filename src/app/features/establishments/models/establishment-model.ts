export type EstablishmentStatus = 'Prospecto' | 'Activo' | 'Baja';
export type EstablishmentRisk = 'Bajo' | 'Medio' | 'Alto';

export interface EstablishmentModel {
  id: string;
  tradeName: string;
  legalName: string;
  rfc: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  state: string;
  municipality: string;
  contactName: string;
  contactPhone: string;
  email: string;
  assignedManager: string;
  contractedPackage: string;
  monthlyFee: number;
  installedCameras: number;
  notes: string;
  status: EstablishmentStatus;
  businessType: string;
  risk: EstablishmentRisk;
  gia: boolean;
  covia: boolean;
}
