import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { DocumentTypeService } from '../../services/document-type.service';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentType, DocumentTypeFormModel } from '../../models/document-type-model';
import { DocumentalArea } from '../../models/documental-area-model';
import { requiredSelectSchema, requiredTextSchema, strictlyPositiveNumberSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;
const AREA_OPTIONS_LIMIT = 100;

@Component({
  selector: 'app-document-types',
  imports: [RouterLink, FormField],
  templateUrl: './document-types.html',
})
export class DocumentTypes {
  private readonly documentTypeService = inject(DocumentTypeService);
  private readonly documentalAreaService = inject(DocumentalAreaService);

  readonly areas = toSignal(
    this.documentalAreaService.findAll({ limit: AREA_OPTIONS_LIMIT }).pipe(map((response) => response.data)),
    { initialValue: [] as DocumentalArea[] },
  );

  readonly search = signal('');
  readonly page = signal(1);
  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  private readonly listResource = rxResource({
    params: () => ({ page: this.page(), search: this.search() }),
    stream: ({ params }) =>
      this.documentTypeService.findAll({ page: params.page, limit: PAGE_SIZE, search: params.search || undefined }).pipe(
        map((response) => ({ ok: true as const, response })),
        catchError(() => of({ ok: false as const })),
      ),
  });

  readonly items = computed<DocumentType[]>(() => {
    const result = this.listResource.value();
    return result?.ok ? result.response.data : [];
  });
  readonly meta = computed(() => {
    const result = this.listResource.value();
    return result?.ok ? result.response.meta : null;
  });
  readonly loading = computed(() => this.listResource.isLoading());
  readonly loadError = computed(() => {
    const result = this.listResource.value();
    return result && !result.ok ? 'No se pudo cargar la información.' : null;
  });

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<number | null>(null);

  readonly typeModel = signal<DocumentTypeFormModel>({ name: '', category_id: '', validity: 12 });
  readonly typeForm = form(this.typeModel, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.category_id, requiredSelectSchema);
    apply(f.validity, strictlyPositiveNumberSchema);
  });

  areaName(categoryId: number): string {
    return this.areas().find((area) => area.id === categoryId)?.area ?? '—';
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);

    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.page.set(1);
    }, SEARCH_DEBOUNCE_MS);
  }

  goToPage(page: number): void {
    const meta = this.meta();
    if (page < 1 || (meta && page > meta.totalPages)) return;
    this.page.set(page);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.typeModel.set({ name: '', category_id: '', validity: 12 });
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(item: DocumentType): void {
    this.editingId.set(item.id);
    this.formError.set(null);
    this.typeModel.set({ name: item.name, category_id: String(item.category_id), validity: item.validity });
    this.dialogRef().nativeElement.showModal();
  }

  closeDialog(): void {
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
        this.closeDialog();
        this.listResource.reload();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el tipo de documento.'));
      } finally {
        this.saving.set(false);
      }
    });
  }

  async toggleStatus(item: DocumentType): Promise<void> {
    this.togglingId.set(item.id);
    try {
      await firstValueFrom(this.documentTypeService.update(item.id, { status: !item.status }));
      this.listResource.reload();
    } catch {
      // Silencioso: igual que el resto de catálogos, togglingId vuelve a null sin cambio de estado.
    } finally {
      this.togglingId.set(null);
    }
  }
}
