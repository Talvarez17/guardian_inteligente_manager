import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstablishmentModel } from '../../models/establishment-model';
import { EstablishmentsStore } from '../../services/establishments-store';

@Component({
  selector: 'app-establishment-detail',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './establishment-detail.html',
})
export class EstablishmentDetail {
  private readonly store = inject(EstablishmentsStore);

  readonly id = input.required<string>();
  readonly establishment = computed(() => this.store.getById(this.id()));

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

  riskBadgeClass(risk: EstablishmentModel['risk']): string {
    switch (risk) {
      case 'Bajo':
        return 'badge-success';
      case 'Medio':
        return 'badge-warning';
      case 'Alto':
        return 'badge-error';
    }
  }
}
