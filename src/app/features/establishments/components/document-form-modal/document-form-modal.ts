import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormField, apply, form } from '@angular/forms/signals';
import 'cally';
import { DocumentModel } from '../../models/document-model';
import { DOCUMENT_AREA_OPTIONS, DOCUMENT_STATUS_OPTIONS } from '../../models/document-options';
import { DocumentsStore } from '../../services/documents-store';
import { requiredTextSchema } from '../../../../shared/forms/field-schemas';

type DocumentFormModel = Omit<DocumentModel, 'id' | 'establishmentId'>;

function emptyModel(): DocumentFormModel {
  return {
    name: '',
    area: DOCUMENT_AREA_OPTIONS[0],
    version: '',
    status: DOCUMENT_STATUS_OPTIONS[0],
    expirationDate: '',
    notes: '',
    fileName: '',
  };
}

@Component({
  selector: 'app-document-form-modal',
  imports: [FormField],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './document-form-modal.html',
})
export class DocumentFormModal {
  private readonly store = inject(DocumentsStore);

  readonly establishmentId = input.required<string>();

  readonly areaOptions = DOCUMENT_AREA_OPTIONS;
  readonly statusOptions = DOCUMENT_STATUS_OPTIONS;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<string | null>(null);
  readonly expirationTouched = signal(false);
  readonly model = signal<DocumentFormModel>(emptyModel());

  readonly documentForm = form(this.model, (f) => {
    apply(f.name, requiredTextSchema);
  });

  readonly expirationInvalid = computed(() => this.expirationTouched() && !this.model().expirationDate);

  open(document?: DocumentModel): void {
    this.expirationTouched.set(false);
    if (document) {
      const { id, establishmentId, ...rest } = document;
      this.editingId.set(id);
      this.model.set(rest);
    } else {
      this.editingId.set(null);
      this.model.set(emptyModel());
    }
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onExpirationChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.model.update((current) => ({ ...current, expirationDate: value }));
    this.expirationTouched.set(true);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.model.update((current) => ({ ...current, fileName: file.name }));
    }
  }

  save(): void {
    this.expirationTouched.set(true);
    if (this.documentForm().invalid() || !this.model().expirationDate) {
      this.documentForm().markAsTouched();
      return;
    }

    const editingId = this.editingId();
    if (editingId) {
      this.store.update(editingId, { establishmentId: this.establishmentId(), ...this.model() });
    } else {
      this.store.add({ id: crypto.randomUUID(), establishmentId: this.establishmentId(), ...this.model() });
    }
    this.close();
  }
}
