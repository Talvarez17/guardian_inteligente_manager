import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentCatalogsService } from '../../services/establishment-catalogs.service';
import { Establishment, EstablishmentStatus, Turnover } from '../../models/establishment-model';
import { ESTABLISHMENT_STATUS_LABELS, ESTABLISHMENT_STATUS_OPTIONS } from '../../models/establishment-options';
import { PaginationMeta } from '../../../../core/models/pagination-model';

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
  readonly turnovers = signal<Turnover[]>([]);

  readonly items = signal<Establishment[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly search = signal('');
  readonly turnoverFilter = signal('');
  readonly statusFilter = signal('');
  readonly page = signal(1);

  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  readonly filtered = computed(() => {
    const turnover = this.turnoverFilter();
    const status = this.statusFilter();

    return this.items().filter((item) => {
      const matchesTurnover = !turnover || item.turnover.id === Number(turnover);
      const matchesStatus = !status || item.establishment_status === status;
      return matchesTurnover && matchesStatus;
    });
  });

  constructor() {
    this.catalogs.getTurnovers().subscribe((turnovers) => this.turnovers.set(turnovers));
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.service.findAll({ page: this.page(), limit: PAGE_SIZE, search: this.search() || undefined }).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudieron cargar los establecimientos.');
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
    this.fetch();
  }

  remove(establishment: Establishment): void {
    if (!confirm(`¿Dar de baja "${establishment.name}"?`)) return;
    this.service.remove(establishment.id).subscribe(() => this.fetch());
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
