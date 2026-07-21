export interface PaymentMethod {
  id: number;
  name: string;
  status: boolean;
}

export interface PaymentForm {
  id: number;
  name: string;
  status: boolean;
}

export interface EstablishmentBilling {
  establishment_id: string;
  monthly_bill: number;
  payment_method: PaymentMethod;
  payment_form: PaymentForm;
}

export interface UpsertEstablishmentBillingPayload {
  monthly_bill: number;
  payment_method_id: number;
  payment_form_id: number;
}
