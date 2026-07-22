import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { firstValueFrom, map } from 'rxjs';
import 'cally';
import { DocumentService } from '../../services/document.service';
import { DocumentalAreaService } from '../../../management/services/documental-area.service';
import { DocumentalArea } from '../../../management/models/documental-area-model';
import { CreateDocumentPayload, Document, DocumentFormModel, UpdateDocumentPayload } from '../../models/document-model';
import { requiredSelectSchema, requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const AREA_OPTIONS_LIMIT = 100;

@Component({
  selector: 'app-document-form-modal',
  imports: [FormField],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './document-form-modal.html',
})
export class DocumentFormModal {
  private readonly documentService = inject(DocumentService);
  private readonly documentalAreaService = inject(DocumentalAreaService);

  readonly establishmentId = input.required<string>();
  readonly saved = output<void>();

  readonly areas = toSignal(
    this.documentalAreaService.findAll({ limit: AREA_OPTIONS_LIMIT }).pipe(map((response) => response.data)),
    { initialValue: [] as DocumentalArea[] },
  );

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly existingFileUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly fileTouched = signal(false);
  readonly expirationTouched = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly model = signal<DocumentFormModel>({ name: '', area_id: '', version: '', expiration_date: '', comments: '' });
  
  readonly documentForm = form(this.model, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.area_id, requiredSelectSchema);
    apply(f.version, requiredTextSchema);
  });

  readonly expirationInvalid = computed(() => this.expirationTouched() && !this.model().expiration_date);
  readonly fileInvalid = computed(() => this.fileTouched() && !this.editingId() && !this.selectedFile());
  readonly selectedFileName = computed(() => this.selectedFile()?.name ?? null);

  open(document?: Document): void {
    this.expirationTouched.set(false);
    this.fileTouched.set(false);
    this.selectedFile.set(null);
    this.formError.set(null);

    if (document) {
      this.editingId.set(document.id);
      this.existingFileUrl.set(document.url);
      this.model.set({
        name: document.name,
        area_id: String(document.area.id),
        version: document.version,
        expiration_date: document.expiration_date,
        comments: document.comments ?? '',
      });
    } else {
      this.editingId.set(null);
      this.existingFileUrl.set(null);
      this.model.set({ name: '', area_id: '', version: '', expiration_date: '', comments: '' });
    }
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onExpirationChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.model.update((current) => ({ ...current, expiration_date: value }));
    this.expirationTouched.set(true);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.fileTouched.set(true);
    if (file) {
      this.selectedFile.set(file);
    }
  }

  async save(): Promise<void> {
    this.expirationTouched.set(true);
    this.fileTouched.set(true);

    await submit(this.documentForm, async () => {
      if (!this.model().expiration_date || this.fileInvalid()) {
        return;
      }

      this.saving.set(true);
      this.formError.set(null);

      try {
        const editingId = this.editingId();
        const file = this.selectedFile() ?? undefined;

        if (editingId) {
          const payload: UpdateDocumentPayload = { ...this.model(), area_id: Number(this.model().area_id) };
          await firstValueFrom(this.documentService.update(editingId, payload, file));
        } else {
          const payload: CreateDocumentPayload = {
            establishment_id: this.establishmentId(),
            ...this.model(),
            area_id: Number(this.model().area_id),
          };
          await firstValueFrom(this.documentService.create(payload, file!));
        }

        this.saved.emit();
        this.close();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el documento.'));
      } finally {
        this.saving.set(false);
      }
    });
  }
}
