import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, apply, form } from '@angular/forms/signals';
import { catchError, of } from 'rxjs';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentContactService } from '../../services/establishment-contact.service';
import { EstablishmentOperationService } from '../../services/establishment-operation.service';
import { EstablishmentBillingService } from '../../services/establishment-billing.service';
import { EstablishmentChecklistService } from '../../services/establishment-checklist.service';
import { PaymentRecordService } from '../../services/payment-record.service';
import { Establishment, EstablishmentStatus } from '../../models/establishment-model';
import { ESTABLISHMENT_RISK_LABELS, ESTABLISHMENT_STATUS_LABELS } from '../../models/establishment-options';
import { EstablishmentContact } from '../../models/establishment-contact-model';
import { EstablishmentOperation } from '../../models/establishment-operation-model';
import { EstablishmentBilling } from '../../models/establishment-billing-model';
import { EstablishmentChecklistEntry } from '../../models/establishment-checklist-model';
import { CreatePaymentRecordPayload, PaymentFormModel, PaymentRecord, PaymentSummary } from '../../models/payment-record-model';
import { DocumentsPanel } from '../../components/documents-panel/documents-panel';
import { monthSchema, requiredTextSchema, strictlyPositiveNumberSchema, yearSchema } from '../../../../shared/forms/field-schemas';

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

  readonly establishment = signal<Establishment | null | undefined>(undefined);
  readonly contact = signal<EstablishmentContact | null>(null);
  readonly operation = signal<EstablishmentOperation | null>(null);
  readonly billing = signal<EstablishmentBilling | null>(null);
  readonly checklist = signal<EstablishmentChecklistEntry[]>([]);

  readonly paymentRecords = signal<PaymentRecord[]>([]);
  readonly paymentSummary = signal<PaymentSummary | null>(null);
  readonly loadingPayments = signal(false);
  readonly savingPayment = signal(false);
  readonly paymentError = signal<string | null>(null);

  readonly paymentModel = signal<PaymentFormModel>(emptyPaymentModel());
  
  readonly paymentForm = form(this.paymentModel, (f) => {
    apply(f.folio, requiredTextSchema);
    apply(f.amount, strictlyPositiveNumberSchema);
    apply(f.period_month, monthSchema);
    apply(f.period_year, yearSchema);
  });

  private loadedId: string | null = null;

  private readonly loadOnIdChange = effect(() => {
    const establishmentId = this.id();
    if (establishmentId && establishmentId !== this.loadedId) {
      this.loadedId = establishmentId;
      this.load(establishmentId);
    }
  });

  private load(establishmentId: string): void {
    this.establishmentService.findOne(establishmentId).subscribe({
      next: (establishment) => this.establishment.set(establishment),
      error: () => this.establishment.set(null),
    });

    this.contactService
      .findByEstablishment(establishmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((contact) => this.contact.set(contact));

    this.operationService
      .findByEstablishment(establishmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((operation) => this.operation.set(operation));

    this.billingService
      .findByEstablishment(establishmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((billing) => this.billing.set(billing));

    this.checklistService
      .findChecklist(establishmentId)
      .pipe(catchError(() => of([] as EstablishmentChecklistEntry[])))
      .subscribe((checklist) => this.checklist.set(checklist));

    this.loadPayments();
  }

  private loadPayments(): void {
    const establishmentId = this.id();
    this.loadingPayments.set(true);

    this.paymentRecordService.findAllByEstablishment(establishmentId, { page: 1, limit: 50 }).subscribe({
      next: (response) => {
        this.paymentRecords.set(response.data);
        this.loadingPayments.set(false);
      },
      error: () => this.loadingPayments.set(false),
    });

    this.paymentRecordService
      .getSummary(establishmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((summary) => this.paymentSummary.set(summary));
  }

  addPaymentRecord(): void {
    if (this.paymentForm().invalid()) {
      this.paymentForm().markAsTouched();
      return;
    }

    this.savingPayment.set(true);
    this.paymentError.set(null);

    const payload: CreatePaymentRecordPayload = { establishment_id: this.id(), ...this.paymentModel() };

    this.paymentRecordService.create(payload).subscribe({
      next: () => {
        this.savingPayment.set(false);
        this.paymentModel.set(emptyPaymentModel());
        this.loadPayments();
      },
      error: (error: HttpErrorResponse) => {
        this.savingPayment.set(false);
        const message = error.error?.message;
        this.paymentError.set(Array.isArray(message) ? message.join(', ') : message ?? 'No se pudo registrar el pago.');
      },
    });
  }

  removePaymentRecord(record: PaymentRecord): void {
    if (!confirm(`¿Eliminar el pago con folio "${record.folio}"?`)) return;
    this.paymentRecordService.remove(record.id).subscribe(() => this.loadPayments());
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
