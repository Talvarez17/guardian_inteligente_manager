export interface PlanFeatureItem {
  id: number;
  name: string;
  status: boolean;
}

export interface PlanModel {
  id: number;
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  trial: number;
  tries: number;
  comments: string;
  status: boolean;
  features: PlanFeatureItem[];
}

export interface CreatePlanPayload {
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  trial: number;
  tries: number;
  comments: string;
  featureIds: number[];
}

export interface UpdatePlanPayload {
  name?: string;
  trial?: number;
  comments?: string;
  featureIds?: number[];
  status?: boolean;
}

export interface PlanFormValue {
  name: string;
  amount: number;
  frequency: string;
  trial: number;
  tries: number;
  comments: string;
}
