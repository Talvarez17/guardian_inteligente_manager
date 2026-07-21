export interface PaymentRecord {
  id: number;
  establishment: { id: string };
  period_month: number;
  period_year: number;
  folio: string;
  amount: number;
}

export interface CreatePaymentRecordPayload {
  establishment_id: string;
  period_month: number;
  period_year: number;
  folio: string;
  amount: number;
}

export type UpdatePaymentRecordPayload = Partial<Omit<CreatePaymentRecordPayload, 'establishment_id'>>;

export interface PaymentFormModel {
  period_month: number;
  period_year: number;
  folio: string;
  amount: number;
}

export interface PaymentSummary {
  totalPaid: number;
  monthlyBill: number | null;
  monthsElapsed: number | null;
  expectedTotal: number | null;
  overdueBalance: number | null;
}
