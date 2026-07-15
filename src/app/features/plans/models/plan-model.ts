export type PlanRepeatUnit = 'Diario' | 'Semanal' | 'Mensual' | 'Anual';

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanModel {
  id: string;
  name: string;
  amount: number;
  repeatEvery: number;
  repeatUnit: PlanRepeatUnit;
  trialDays: number;
  retryAttempts: number;
  notes: string;
  features: PlanFeature[];
}
