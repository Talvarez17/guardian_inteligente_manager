import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstablishmentModel } from '../../models/establishment-model';
import { BUSINESS_TYPE_OPTIONS, MANAGER_OPTIONS, RISK_OPTIONS } from '../../models/establishment-options';
import { EstablishmentsStore } from '../../services/establishments-store';

@Component({
  selector: 'app-establishments',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './establishments.html',
})
export class Establishments {
  private readonly store = inject(EstablishmentsStore);

  readonly businessTypeOptions = BUSINESS_TYPE_OPTIONS;
  readonly riskOptions = RISK_OPTIONS;
  readonly managerOptions = MANAGER_OPTIONS;

  readonly search = signal('');
  readonly businessTypeFilter = signal('');
  readonly riskFilter = signal('');
  readonly managerFilter = signal('');

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const businessType = this.businessTypeFilter();
    const risk = this.riskFilter();
    const manager = this.managerFilter();

    return this.store.establishments().filter((item) => {
      const matchesSearch =
        !term ||
        item.tradeName.toLowerCase().includes(term) ||
        item.legalName.toLowerCase().includes(term);
      const matchesBusinessType = !businessType || item.businessType === businessType;
      const matchesRisk = !risk || item.risk === risk;
      const matchesManager = !manager || item.assignedManager === manager;
      return matchesSearch && matchesBusinessType && matchesRisk && matchesManager;
    });
  });

  onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onBusinessTypeChange(event: Event): void {
    this.businessTypeFilter.set((event.target as HTMLSelectElement).value);
  }

  onRiskChange(event: Event): void {
    this.riskFilter.set((event.target as HTMLSelectElement).value);
  }

  onManagerChange(event: Event): void {
    this.managerFilter.set((event.target as HTMLSelectElement).value);
  }

  statusBadgeClass(status: EstablishmentModel['status']): string {
    switch (status) {
      case 'Activo':
        return 'badge-success';
      case 'Prospecto':
        return 'badge-info';
      case 'Baja':
        return 'badge-error';
    }
  }

  statusIcon(status: EstablishmentModel['status']): string {
    switch (status) {
      case 'Activo':
        return 'check_circle';
      case 'Prospecto':
        return 'info';
      case 'Baja':
        return 'error';
    }
  }

  riskBarClasses(risk: EstablishmentModel['risk']): [string, string, string] {
    const off = 'bg-base-300';
    switch (risk) {
      case 'Bajo':
        return ['bg-success', off, off];
      case 'Medio':
        return ['bg-warning', 'bg-warning', off];
      case 'Alto':
        return ['bg-error', 'bg-error', 'bg-error'];
    }
  }

  riskTextClass(risk: EstablishmentModel['risk']): string {
    switch (risk) {
      case 'Bajo':
        return 'text-success';
      case 'Medio':
        return 'text-warning';
      case 'Alto':
        return 'text-error';
    }
  }
}
