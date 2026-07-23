import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of } from 'rxjs';
import { DocumentService } from '../../services/document.service';
import { Document, DocumentComputedStatus } from '../../models/document-model';
import { DocumentFormModal } from '../document-form-modal/document-form-modal';
import { computeDocumentStatus, documentStatusBadgeClass, documentStatusLabel } from '../../../../shared/utils/document-status.util';

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
    return computeDocumentStatus(document.expiration_date);
  }

  statusLabel(status: DocumentComputedStatus): string {
    return documentStatusLabel(status);
  }

  statusBadgeClass(status: DocumentComputedStatus): string {
    return documentStatusBadgeClass(status);
  }
}
