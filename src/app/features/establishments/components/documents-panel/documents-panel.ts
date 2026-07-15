import { Component, computed, inject, input, viewChild } from '@angular/core';
import { DocumentModel } from '../../models/document-model';
import { DocumentsStore } from '../../services/documents-store';
import { DocumentFormModal } from '../document-form-modal/document-form-modal';

@Component({
  selector: 'app-documents-panel',
  imports: [DocumentFormModal],
  templateUrl: './documents-panel.html',
  host: { class: 'contents' },
})
export class DocumentsPanel {
  private readonly store = inject(DocumentsStore);

  readonly establishmentId = input.required<string>();
  readonly documents = computed(() => this.store.listByEstablishment(this.establishmentId()));

  readonly modal = viewChild.required(DocumentFormModal);

  openCreate(): void {
    this.modal().open();
  }

  openEdit(document: DocumentModel): void {
    this.modal().open(document);
  }

  removeDocument(document: DocumentModel): void {
    if (confirm(`¿Eliminar el documento "${document.name}"?`)) {
      this.store.remove(document.id);
    }
  }

  statusBadgeClass(status: DocumentModel['status']): string {
    switch (status) {
      case 'Vigente':
        return 'badge-success';
      case 'Por vencer':
        return 'badge-warning';
      case 'Vencido':
        return 'badge-error';
    }
  }
}
