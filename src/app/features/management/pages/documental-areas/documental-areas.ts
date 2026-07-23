import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentalArea } from '../../models/documental-area-model';
import { DocumentalAreaFormModal } from '../../components/documental-area-form-modal/documental-area-form-modal';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

@Component({
  selector: 'app-documental-areas',
  imports: [RouterLink, DocumentalAreaFormModal],
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

  readonly togglingId = signal<number | null>(null);

  private readonly modal = viewChild.required(DocumentalAreaFormModal);

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
    this.modal().open();
  }

  openEdit(item: DocumentalArea): void {
    this.modal().open(item);
  }

  onSaved(): void {
    this.listResource.reload();
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
