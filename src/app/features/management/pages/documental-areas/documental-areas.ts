import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentalArea, DocumentalAreaFormModel } from '../../models/documental-area-model';
import { requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

@Component({
  selector: 'app-documental-areas',
  imports: [RouterLink, FormField],
  templateUrl: './documental-areas.html',
})
export class DocumentalAreas {
  private readonly documentalAreaService = inject(DocumentalAreaService);

  readonly search = signal('');
  readonly page = signal(1);
  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  private readonly listResource = rxResource({
    params: () => ({ page: this.page(), search: this.search() }),
    stream: ({ params }) =>
      this.documentalAreaService.findAll({ page: params.page, limit: PAGE_SIZE, search: params.search || undefined }).pipe(
        map((response) => ({ ok: true as const, response })),
        catchError(() => of({ ok: false as const })),
      ),
  });

  readonly items = computed<DocumentalArea[]>(() => {
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

  readonly areaModel = signal<DocumentalAreaFormModel>({ area: '', description: '', color: '#2563eb' });
  readonly areaForm = form(this.areaModel, (f) => {
    apply(f.area, requiredTextSchema);
    apply(f.description, requiredTextSchema);
  });

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
    this.areaModel.set({ area: '', description: '', color: '#2563eb' });
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(item: DocumentalArea): void {
    this.editingId.set(item.id);
    this.formError.set(null);
    this.areaModel.set({ area: item.area, description: item.description, color: item.color });
    this.dialogRef().nativeElement.showModal();
  }

  closeDialog(): void {
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
        this.closeDialog();
        this.listResource.reload();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el área documental.'));
      } finally {
        this.saving.set(false);
      }
    });
  }

  async toggleStatus(item: DocumentalArea): Promise<void> {
    this.togglingId.set(item.id);
    try {
      await firstValueFrom(this.documentalAreaService.update(item.id, { status: !item.status }));
      this.listResource.reload();
    } catch {
      // Silencioso: igual que el resto de catálogos, togglingId vuelve a null sin cambio de estado.
    } finally {
      this.togglingId.set(null);
    }
  }
}
