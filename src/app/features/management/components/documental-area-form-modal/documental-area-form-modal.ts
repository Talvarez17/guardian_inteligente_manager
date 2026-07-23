import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentalArea, DocumentalAreaFormModel } from '../../models/documental-area-model';
import { requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';
import { ColorPicker } from '../../../../shared/ui/color-picker/color-picker';

const EMPTY_MODEL: DocumentalAreaFormModel = { area: '', description: '', color: '#2563eb' };

@Component({
  selector: 'app-documental-area-form-modal',
  imports: [FormField, ColorPicker],
  templateUrl: './documental-area-form-modal.html',
})
export class DocumentalAreaFormModal {
  private readonly documentalAreaService = inject(DocumentalAreaService);

  readonly saved = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly areaModel = signal<DocumentalAreaFormModel>({ ...EMPTY_MODEL });
  readonly areaForm = form(this.areaModel, (f) => {
    apply(f.area, requiredTextSchema);
    apply(f.description, requiredTextSchema);
  });

  open(item?: DocumentalArea): void {
    this.formError.set(null);

    if (item) {
      this.editingId.set(item.id);
      this.areaModel.set({ area: item.area, description: item.description, color: item.color });
    } else {
      this.editingId.set(null);
      this.areaModel.set({ ...EMPTY_MODEL });
    }

    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  async save(): Promise<void> {
    await submit(this.areaForm, async () => {
      this.saving.set(true);
      this.formError.set(null);

      const editingId = this.editingId();

      try {
        if (editingId) {
          await firstValueFrom(this.documentalAreaService.update(editingId, this.areaModel()));
        } else {
          await firstValueFrom(this.documentalAreaService.create(this.areaModel()));
        }
        this.saved.emit();
        this.close();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el área documental.'));
      } finally {
        this.saving.set(false);
      }
    });
  }
}
