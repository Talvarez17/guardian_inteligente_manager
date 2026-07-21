import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, apply, form } from '@angular/forms/signals';

import { CatalogAdapter, CatalogItem, ItemFormModel } from '../../models/catalog-crud-model';
import { PaginationMeta } from '../../../../core/models/pagination-model';
import { requiredTextSchema } from '../../../../shared/forms/field-schemas';

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

  readonly items = signal<CatalogItem[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly activeCount = computed(() => this.items().filter((item) => item.status).length);
  readonly inactiveCount = computed(() => this.items().length - this.activeCount());

  readonly search = signal('');
  readonly page = signal(1);
  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<number | null>(null);

  readonly itemModel = signal<ItemFormModel>({ name: '' });
  readonly itemForm = form(this.itemModel, (f) => {
    apply(f.name, requiredTextSchema);
  });

  private loadedAdapterKey: string | null = null;

  private readonly loadOnAdapterReady = effect(() => {
    const currentAdapter = this.adapter();
    if (currentAdapter && currentAdapter.key !== this.loadedAdapterKey) {
      this.loadedAdapterKey = currentAdapter.key;
      this.fetch();
    }
  });

  private fetch(): void {
    this.loading.set(true);
    this.loadError.set(null);

    const limit = this.mode() === 'full' ? FULL_PAGE_SIZE : SUMMARY_FETCH_LIMIT;

    this.adapter()
      .findAll({ page: this.page(), limit, search: this.mode() === 'full' ? this.search() || undefined : undefined })
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.meta.set(response.meta);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('No se pudo cargar la información.');
          this.loading.set(false);
        },
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);

    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.page.set(1);
      this.fetch();
    }, SEARCH_DEBOUNCE_MS);
  }

  goToPage(page: number): void {
    const meta = this.meta();
    if (page < 1 || (meta && page > meta.totalPages)) return;
    this.page.set(page);
    this.fetch();
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

  save(): void {
    if (this.itemForm().invalid()) {
      this.itemForm().markAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const name = this.itemModel().name;
    const editingId = this.editingId();
    const request$ = editingId ? this.adapter().update(editingId, { name }) : this.adapter().create(name);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.fetch();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        const message = error.error?.message;
        this.formError.set(Array.isArray(message) ? message.join(', ') : message ?? 'No se pudo guardar el registro.');
      },
    });
  }

  toggleStatus(item: CatalogItem): void {
    this.togglingId.set(item.id);
    this.adapter()
      .update(item.id, { status: !item.status })
      .subscribe({
        next: () => {
          this.togglingId.set(null);
          this.fetch();
        },
        error: () => this.togglingId.set(null),
      });
  }
}
