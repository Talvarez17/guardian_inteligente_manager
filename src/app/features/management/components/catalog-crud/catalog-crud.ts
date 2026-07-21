import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';

import { CatalogAdapter, CatalogItem, ItemFormModel } from '../../models/catalog-crud-model';
import { requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

const SEARCH_DEBOUNCE_MS = 350;
// Compact mode fetches the whole catalog (no server-side pagination) to compute accurate
// total/active/inactive counts — fine as long as these catalogs stay small lookup tables.
// Capped at 100 to match the backend's PaginationQueryDto @Max(100) limit validation.
const SUMMARY_FETCH_LIMIT = 100;
const FULL_PAGE_SIZE = 10;

@Component({
  selector: 'app-catalog-crud',
  imports: [RouterLink, FormField],
  templateUrl: './catalog-crud.html',
})
export class CatalogCrud {
  readonly adapter = input.required<CatalogAdapter>();
  readonly mode = input<'compact' | 'full'>('compact');
  readonly viewAllRoute = input<string | null>(null);

  readonly search = signal('');
  readonly page = signal(1);
  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  private readonly listResource = rxResource({
    params: () => ({
      adapter: this.adapter(),
      mode: this.mode(),
      page: this.page(),
      search: this.mode() === 'full' ? this.search() : '',
    }),
    stream: ({ params }) => {
      const limit = params.mode === 'full' ? FULL_PAGE_SIZE : SUMMARY_FETCH_LIMIT;
      return params.adapter
        .findAll({ page: params.page, limit, search: params.mode === 'full' ? params.search || undefined : undefined })
        .pipe(
          map((response) => ({ ok: true as const, response })),
          catchError(() => of({ ok: false as const })),
        );
    },
  });

  readonly items = computed<CatalogItem[]>(() => {
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

  readonly activeCount = computed(() => this.items().filter((item) => item.status).length);
  readonly inactiveCount = computed(() => this.items().length - this.activeCount());

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<number | null>(null);

  readonly itemModel = signal<ItemFormModel>({ name: '' });
  readonly itemForm = form(this.itemModel, (f) => {
    apply(f.name, requiredTextSchema);
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
    this.itemModel.set({ name: '' });
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(item: CatalogItem): void {
    this.editingId.set(item.id);
    this.formError.set(null);
    this.itemModel.set({ name: item.name });
    this.dialogRef().nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialogRef().nativeElement.close();
  }

  async save(): Promise<void> {
    await submit(this.itemForm, async () => {
      this.saving.set(true);
      this.formError.set(null);

      const name = this.itemModel().name;
      const editingId = this.editingId();

      try {
        if (editingId) {
          await firstValueFrom(this.adapter().update(editingId, { name }));
        } else {
          await firstValueFrom(this.adapter().create(name));
        }
        this.closeDialog();
        this.listResource.reload();
      } catch (error) {
        this.formError.set(resolveErrorMessage(error, 'No se pudo guardar el registro.'));
      } finally {
        this.saving.set(false);
      }
    });
  }

  async toggleStatus(item: CatalogItem): Promise<void> {
    this.togglingId.set(item.id);
    try {
      await firstValueFrom(this.adapter().update(item.id, { status: !item.status }));
      this.listResource.reload();
    } catch {
      // Silencioso: igual que antes, el usuario ve que togglingId vuelve a null sin cambio de estado.
    } finally {
      this.togglingId.set(null);
    }
  }
}
