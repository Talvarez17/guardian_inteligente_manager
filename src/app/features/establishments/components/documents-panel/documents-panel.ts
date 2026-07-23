import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of } from 'rxjs';
import { DocumentService } from '../../services/document.service';
import { Document, DocumentComputedStatus } from '../../models/document-model';
import { DocumentFormModal } from '../document-form-modal/document-form-modal';
import {
  computeDocumentStatus,
  documentStatusAccentClass,
  documentStatusAvatarClass,
  documentStatusLabel,
  documentStatusTextClass,
} from '../../../../shared/utils/document-status.util';
import { ConfirmDeleteModal } from '../../../../shared/ui/confirm-delete-modal/confirm-delete-modal';

const PAGE_LIMIT = 50;
const STATUS_OPTIONS: DocumentComputedStatus[] = ['vigente', 'por-vencer', 'vencido'];

@Component({
  selector: 'app-documents-panel',
  imports: [DocumentFormModal, ConfirmDeleteModal, NgTemplateOutlet],
  templateUrl: './documents-panel.html',
  host: { class: 'contents' },
})
export class DocumentsPanel {
  private readonly documentService = inject(DocumentService);

  readonly establishmentId = input.required<string>();
  readonly mode = input<'compact' | 'full'>('compact');
  readonly statusOptions = STATUS_OPTIONS;

  private readonly documentsResource = rxResource({
    params: () => this.establishmentId(),
    stream: ({ params }) =>
      this.documentService.findAllByEstablishment(params, { limit: PAGE_LIMIT }).pipe(catchError(() => of(null))),
  });

  readonly documents = computed<Document[]>(() => this.documentsResource.value()?.data ?? []);
  readonly loading = computed(() => this.documentsResource.isLoading());

  readonly search = signal('');
  readonly areaFilter = signal('');
  readonly statusFilter = signal<DocumentComputedStatus | ''>('');

  readonly areaOptions = computed(() => {
    const byId = new Map(this.documents().map((document) => [document.area.id, document.area]));
    return [...byId.values()].sort((a, b) => a.area.localeCompare(b.area));
  });

  readonly filtered = computed(() => {
    const search = this.search().trim().toLowerCase();
    const area = this.areaFilter();
    const status = this.statusFilter();

    return this.documents().filter((document) => {
      const matchesSearch = !search || document.name.toLowerCase().includes(search);
      const matchesArea = !area || document.area.id === Number(area);
      const matchesStatus = !status || this.computedStatus(document) === status;
      return matchesSearch && matchesArea && matchesStatus;
    });
  });

  readonly removingId = signal<number | null>(null);
  private readonly pendingRemoval = signal<Document | null>(null);

  readonly modal = viewChild.required(DocumentFormModal);
  private readonly confirmModal = viewChild.required(ConfirmDeleteModal);

  openCreate(): void {
    this.modal().open();
  }

  onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onAreaFilterChange(event: Event): void {
    this.areaFilter.set((event.target as HTMLSelectElement).value);
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as DocumentComputedStatus | '');
  }

  openEdit(document: Document): void {
    this.modal().open(document);
  }

  onSaved(): void {
    this.documentsResource.reload();
  }

  askRemoveDocument(document: Document): void {
    this.pendingRemoval.set(document);
    this.confirmModal().open(document.name);
  }

  async confirmRemoveDocument(): Promise<void> {
    const document = this.pendingRemoval();
    if (!document) return;

    this.removingId.set(document.id);
    try {
      await firstValueFrom(this.documentService.removePermanently(document.id));
      this.pendingRemoval.set(null);
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

  statusAccentClass(status: DocumentComputedStatus): string {
    return documentStatusAccentClass(status);
  }

  statusAvatarClass(status: DocumentComputedStatus): string {
    return documentStatusAvatarClass(status);
  }

  statusTextClass(status: DocumentComputedStatus): string {
    return documentStatusTextClass(status);
  }
}
