import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { firstValueFrom, map } from 'rxjs';
import { DocumentTypeService } from '../../services/document-type.service';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentType, DocumentTypeFormModel } from '../../models/document-type-model';
import { DocumentalArea } from '../../models/documental-area-model';
import { positiveIntegerSchema, requiredSelectSchema, requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const AREA_OPTIONS_LIMIT = 100;
const EMPTY_MODEL: DocumentTypeFormModel = { name: '', category_id: '', validity: 12 };

@Component({
  selector: 'app-document-type-form-modal',
  imports: [FormField],
  templateUrl: './document-type-form-modal.html',
})
export class DocumentTypeFormModal {
  private readonly documentTypeService = inject(DocumentTypeService);
  private readonly documentalAreaService = inject(DocumentalAreaService);

  readonly saved = output<void>();

  readonly areas = toSignal(
    this.documentalAreaService.findAll({ limit: AREA_OPTIONS_LIMIT }).pipe(map((response) => response.data)),
    { initialValue: [] as DocumentalArea[] },
  );

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly typeModel = signal<DocumentTypeFormModel>({ ...EMPTY_MODEL });
  readonly typeForm = form(this.typeModel, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.category_id, requiredSelectSchema);
    apply(f.validity, positiveIntegerSchema);
  });

  open(item?: DocumentType): void {
    this.formError.set(null);

    if (item) {
      this.editingId.set(item.id);
      this.typeModel.set({ name: item.name, category_id: String(item.category_id), validity: item.validity });
    } else {
      this.editingId.set(null);
      this.typeModel.set({ ...EMPTY_MODEL });
    }

    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  async save(): Promise<void> {
    await submit(this.typeForm, async () => {
      this.saving.set(true);
      this.formError.set(null);

      const editingId = this.editingId();
      const payload = { ...this.typeModel(), category_id: Number(this.typeModel().category_id) };

      try {
        if (editingId) {
          await firstValueFrom(this.documentTypeService.update(editingId, payload));
        } else {
          await firstValueFrom(this.documentTypeService.create(payload));
        }
        this.saved.emit();
        this.close();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el tipo de documento.'));
      } finally {
        this.saving.set(false);
      }
    });
  }
}
