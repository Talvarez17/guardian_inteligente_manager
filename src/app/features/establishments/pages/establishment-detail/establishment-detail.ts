import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentContactService } from '../../services/establishment-contact.service';
import { EstablishmentOperationService } from '../../services/establishment-operation.service';
import { EstablishmentBillingService } from '../../services/establishment-billing.service';
import { EstablishmentChecklistService } from '../../services/establishment-checklist.service';
import { PaymentRecordService } from '../../services/payment-record.service';
import { Establishment, EstablishmentStatus } from '../../models/establishment-model';
import { ESTABLISHMENT_RISK_LABELS, ESTABLISHMENT_STATUS_LABELS } from '../../models/establishment-options';
import { EstablishmentChecklistEntry } from '../../models/establishment-checklist-model';
import { CreatePaymentRecordPayload, PaymentFormModel, PaymentRecord } from '../../models/payment-record-model';
import { DocumentsPanel } from '../../components/documents-panel/documents-panel';
import { monthSchema, requiredTextSchema, strictlyPositiveNumberSchema, yearSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const CURRENT_YEAR = new Date().getFullYear();

function emptyPaymentModel(): PaymentFormModel {
  return { period_month: new Date().getMonth() + 1, period_year: CURRENT_YEAR, folio: '', amount: 0 };
}

@Component({
  selector: 'app-establishment-detail',
  imports: [RouterLink, CurrencyPipe, DocumentsPanel, FormField],
  templateUrl: './establishment-detail.html',
})
export class EstablishmentDetail {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly contactService = inject(EstablishmentContactService);
  private readonly operationService = inject(EstablishmentOperationService);
  private readonly billingService = inject(EstablishmentBillingService);
  private readonly checklistService = inject(EstablishmentChecklistService);
  private readonly paymentRecordService = inject(PaymentRecordService);

  readonly id = input.required<string>();

  readonly statusLabels = ESTABLISHMENT_STATUS_LABELS;
  readonly riskLabels = ESTABLISHMENT_RISK_LABELS;

  private readonly establishmentResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.establishmentService.findOne(params).pipe(catchError(() => of(null))),
  });
  readonly establishment = computed<Establishment | null | undefined>(() => this.establishmentResource.value());

  private readonly contactResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.contactService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });
  readonly contact = computed(() => this.contactResource.value());

  private readonly operationResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.operationService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });
  readonly operation = computed(() => this.operationResource.value());

  private readonly billingResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.billingService.findByEstablishment(params).pipe(catchError(() => of(null))),
  });
  readonly billing = computed(() => this.billingResource.value());

  private readonly checklistResource = rxResource({
    params: () => this.id(),
    defaultValue: [] as EstablishmentChecklistEntry[],
    stream: ({ params }) =>
      this.checklistService.findChecklist(params).pipe(catchError(() => of([] as EstablishmentChecklistEntry[]))),
  });
  readonly checklist = computed(() => this.checklistResource.value());

  private readonly paymentRecordsResource = rxResource({
    params: () => this.id(),
    defaultValue: [] as PaymentRecord[],
    stream: ({ params }) =>
      this.paymentRecordService.findAllByEstablishment(params, { page: 1, limit: 50 }).pipe(
        map((response) => response.data),
        catchError(() => of([] as PaymentRecord[])),
      ),
  });
  readonly paymentRecords = computed(() => this.paymentRecordsResource.value());
  readonly loadingPayments = computed(() => this.paymentRecordsResource.isLoading());

  private readonly paymentSummaryResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.paymentRecordService.getSummary(params).pipe(catchError(() => of(null))),
  });
  readonly paymentSummary = computed(() => this.paymentSummaryResource.value());

  readonly savingPayment = signal(false);
  readonly paymentError = signal<string | null>(null);

  readonly paymentModel = signal<PaymentFormModel>(emptyPaymentModel());

  readonly paymentForm = form(this.paymentModel, (f) => {
    apply(f.folio, requiredTextSchema);
    apply(f.amount, strictlyPositiveNumberSchema);
    apply(f.period_month, monthSchema);
    apply(f.period_year, yearSchema);
  });

  async addPaymentRecord(): Promise<void> {
    await submit(this.paymentForm, async () => {
      this.savingPayment.set(true);
      this.paymentError.set(null);

      const payload: CreatePaymentRecordPayload = { establishment_id: this.id(), ...this.paymentModel() };

      try {
        await firstValueFrom(this.paymentRecordService.create(payload));
        this.paymentModel.set(emptyPaymentModel());
        this.paymentRecordsResource.reload();
        this.paymentSummaryResource.reload();
      } catch (error) {
        this.paymentError.set(resolveErrorMessage(error, 'No se pudo registrar el pago.'));
      } finally {
        this.savingPayment.set(false);
      }
    });
  }

  async removePaymentRecord(record: PaymentRecord): Promise<void> {
    if (!confirm(`¿Eliminar el pago con folio "${record.folio}"?`)) return;
    await firstValueFrom(this.paymentRecordService.remove(record.id));
    this.paymentRecordsResource.reload();
    this.paymentSummaryResource.reload();
  }

  statusBadgeClass(status: EstablishmentStatus): string {
    switch (status) {
      case EstablishmentStatus.CLIENT:
        return 'badge-success';
      case EstablishmentStatus.PROSPECT:
        return 'badge-info';
      case EstablishmentStatus.DEACTIVATE:
        return 'badge-error';
    }
  }

  monthLabel(month: number): string {
    const labels = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return labels[month - 1] ?? String(month);
  }
}
