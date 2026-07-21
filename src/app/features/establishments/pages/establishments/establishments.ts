import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentCatalogsService } from '../../services/establishment-catalogs.service';
import { Establishment, EstablishmentStatus, Turnover } from '../../models/establishment-model';
import { ESTABLISHMENT_STATUS_LABELS, ESTABLISHMENT_STATUS_OPTIONS } from '../../models/establishment-options';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

@Component({
  selector: 'app-establishments',
  imports: [RouterLink],
  templateUrl: './establishments.html',
})
export class Establishments {
  private readonly service = inject(EstablishmentService);
  private readonly catalogs = inject(EstablishmentCatalogsService);

  readonly statusOptions = ESTABLISHMENT_STATUS_OPTIONS;
  readonly statusLabels = ESTABLISHMENT_STATUS_LABELS;
  readonly turnovers = toSignal(this.catalogs.getTurnovers(), { initialValue: [] as Turnover[] });

  readonly search = signal('');
  readonly turnoverFilter = signal('');
  readonly statusFilter = signal('');
  readonly page = signal(1);

  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  private readonly listResource = rxResource({
    params: () => ({ page: this.page(), search: this.search() }),
    stream: ({ params }) =>
      this.service.findAll({ page: params.page, limit: PAGE_SIZE, search: params.search || undefined }).pipe(
        map((response) => ({ ok: true as const, response })),
        catchError(() => of({ ok: false as const })),
      ),
  });

  readonly items = computed<Establishment[]>(() => {
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
    return result && !result.ok ? 'No se pudieron cargar los establecimientos.' : null;
  });

  readonly filtered = computed(() => {
    const turnover = this.turnoverFilter();
    const status = this.statusFilter();

    return this.items().filter((item) => {
      const matchesTurnover = !turnover || item.turnover.id === Number(turnover);
      const matchesStatus = !status || item.establishment_status === status;
      return matchesTurnover && matchesStatus;
    });
  });

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);

    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.page.set(1);
    }, SEARCH_DEBOUNCE_MS);
  }

  onTurnoverFilterChange(event: Event): void {
    this.turnoverFilter.set((event.target as HTMLSelectElement).value);
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  goToPage(page: number): void {
    const meta = this.meta();
    if (page < 1 || (meta && page > meta.totalPages)) return;
    this.page.set(page);
  }

  async remove(establishment: Establishment): Promise<void> {
    if (!confirm(`¿Dar de baja "${establishment.name}"?`)) return;
    await firstValueFrom(this.service.remove(establishment.id));
    this.listResource.reload();
  }

  statusBadgeClass(status: EstablishmentStatus): string {
    switch (status) {
      case EstablishmentStatus.CLIENT:
        return 'badge-success';
      case EstablishmentStatus.PROSPECT:
        return 'badge-info';
      case EstablishmentStatus.DEACTIVATE:
        return 'badge-error';
    }
  }

  statusIcon(status: EstablishmentStatus): string {
    switch (status) {
      case EstablishmentStatus.CLIENT:
        return 'check_circle';
      case EstablishmentStatus.PROSPECT:
        return 'info';
      case EstablishmentStatus.DEACTIVATE:
        return 'error';
    }
  }
}
