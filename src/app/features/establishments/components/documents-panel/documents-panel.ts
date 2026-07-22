import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of } from 'rxjs';
import { DocumentService } from '../../services/document.service';
import { Document, DocumentComputedStatus } from '../../models/document-model';
import { DocumentFormModal } from '../document-form-modal/document-form-modal';

const DUE_SOON_THRESHOLD_DAYS = 30;
const PAGE_LIMIT = 50;

@Component({
  selector: 'app-documents-panel',
  imports: [DocumentFormModal],
  templateUrl: './documents-panel.html',
  host: { class: 'contents' },
})
export class DocumentsPanel {
  private readonly documentService = inject(DocumentService);

  readonly establishmentId = input.required<string>();

  private readonly documentsResource = rxResource({
    params: () => this.establishmentId(),
    stream: ({ params }) =>
      this.documentService.findAllByEstablishment(params, { limit: PAGE_LIMIT }).pipe(catchError(() => of(null))),
  });

  readonly documents = computed<Document[]>(() => this.documentsResource.value()?.data ?? []);
  readonly loading = computed(() => this.documentsResource.isLoading());

  readonly removingId = signal<number | null>(null);

  readonly modal = viewChild.required(DocumentFormModal);

  openCreate(): void {
    this.modal().open();
  }

  openEdit(document: Document): void {
    this.modal().open(document);
  }

  onSaved(): void {
    this.documentsResource.reload();
  }

  async removeDocument(document: Document): Promise<void> {
    if (!confirm(`¿Eliminar el documento "${document.name}"?`)) return;

    this.removingId.set(document.id);
    try {
      await firstValueFrom(this.documentService.removePermanently(document.id));
      this.documentsResource.reload();
    } finally {
      this.removingId.set(null);
    }
  }

  computedStatus(document: Document): DocumentComputedStatus {
    const daysUntilExpiration = (new Date(document.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiration < 0) return 'vencido';
    if (daysUntilExpiration <= DUE_SOON_THRESHOLD_DAYS) return 'por-vencer';
    return 'vigente';
  }

  statusLabel(status: DocumentComputedStatus): string {
    switch (status) {
      case 'vigente':
        return 'Vigente';
      case 'por-vencer':
        return 'Por vencer';
      case 'vencido':
        return 'Vencido';
    }
  }

  statusBadgeClass(status: DocumentComputedStatus): string {
    switch (status) {
      case 'vigente':
        return 'badge-success';
      case 'por-vencer':
        return 'badge-warning';
      case 'vencido':
        return 'badge-error';
    }
  }
}
