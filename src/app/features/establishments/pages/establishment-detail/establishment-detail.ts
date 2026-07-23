import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentContactService } from '../../services/establishment-contact.service';
import { EstablishmentOperationService } from '../../services/establishment-operation.service';
import { EstablishmentBillingService } from '../../services/establishment-billing.service';
import { EstablishmentChecklistService } from '../../services/establishment-checklist.service';
import { DocumentService } from '../../services/document.service';
import { Establishment, EstablishmentStatus } from '../../models/establishment-model';
import { ESTABLISHMENT_RISK_LABELS, ESTABLISHMENT_STATUS_LABELS } from '../../models/establishment-options';
import { EstablishmentChecklistEntry } from '../../models/establishment-checklist-model';
import { computeDocumentStatus } from '../../../../shared/utils/document-status.util';
import { ConfirmDeleteModal } from '../../../../shared/ui/confirm-delete-modal/confirm-delete-modal';

const DOCUMENTS_SUMMARY_LIMIT = 100;

@Component({
  selector: 'app-establishment-detail',
  imports: [RouterLink, CurrencyPipe, ConfirmDeleteModal],
  templateUrl: './establishment-detail.html',
})
export class EstablishmentDetail {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly contactService = inject(EstablishmentContactService);
  private readonly operationService = inject(EstablishmentOperationService);
  private readonly billingService = inject(EstablishmentBillingService);
  private readonly checklistService = inject(EstablishmentChecklistService);
  private readonly documentService = inject(DocumentService);
  private readonly router = inject(Router);

  private readonly confirmModal = viewChild.required(ConfirmDeleteModal);

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

  private readonly documentsResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) =>
      this.documentService.findAllByEstablishment(params, { limit: DOCUMENTS_SUMMARY_LIMIT }).pipe(catchError(() => of(null))),
  });
  readonly documentsSummary = computed(() => {
    const documents = this.documentsResource.value()?.data ?? [];
    const summary = { total: documents.length, vigente: 0, porVencer: 0, vencido: 0 };
    for (const document of documents) {
      const status = computeDocumentStatus(document.expiration_date);
      if (status === 'vigente') summary.vigente++;
      else if (status === 'por-vencer') summary.porVencer++;
      else summary.vencido++;
    }
    return summary;
  });

  documentsBadgeLabel(): string {
    const summary = this.documentsSummary();
    if (summary.vencido) return `${summary.vencido} vencido${summary.vencido > 1 ? 's' : ''}`;
    if (summary.porVencer) return `${summary.porVencer} por vencer`;
    if (summary.total) return `${summary.total} vigente${summary.total > 1 ? 's' : ''}`;
    return 'Sin documentos';
  }

  documentsTextClass(): string {
    const summary = this.documentsSummary();
    if (summary.vencido) return 'text-error';
    if (summary.porVencer) return 'text-warning';
    if (summary.total) return 'text-base-content';
    return 'text-base-content/50';
  }

  documentsStripClass(): string {
    const summary = this.documentsSummary();
    if (summary.vencido) return 'bg-error text-error-content';
    if (summary.porVencer) return 'bg-warning text-warning-content';
    return 'bg-primary text-primary-content';
  }

  askRemove(establishment: Establishment): void {
    this.confirmModal().open(establishment.name);
  }

  async confirmRemove(): Promise<void> {
    const establishment = this.establishment();
    if (!establishment) return;

    await firstValueFrom(this.establishmentService.remove(establishment.id));
    this.router.navigate(['/establecimientos']);
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
}
