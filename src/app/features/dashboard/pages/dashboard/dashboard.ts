import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCardModel } from '../../models/stat-card-model';
import { QuickAccessModel } from '../../models/quick-access-model';
import { ExpirationsPanel } from '../../components/expirations-panel/expirations-panel';
import { CapacityPanel } from '../../components/capacity-panel/capacity-panel';
import { PlansPanel } from '../../components/plans-panel/plans-panel';
import { FacesPanel } from '../../components/faces-panel/faces-panel';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, ExpirationsPanel, CapacityPanel, FacesPanel, PlansPanel],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly updatedAt = '13/07/26, 2:48 p.m.';

  readonly stats: StatCardModel[] = [
    { icon: 'apartment', iconColor: 'text-primary', value: '6', label: 'Clientes activos' },
    { icon: 'person', iconColor: 'text-accent', value: '1', label: 'Prospectos' },
    { icon: 'description', iconColor: 'text-info', value: '12', label: 'Documentos totales' },
    { icon: 'face', iconColor: 'text-secondary', value: '8', label: 'Rostros registrados' },
    { icon: 'groups', iconColor: 'text-primary', value: '832', label: 'Aforo actual' },
    { icon: 'diamond', iconColor: 'text-success', value: '4', label: 'Planes Guardian' },
    { icon: 'payments', iconColor: 'text-warning', value: '$180,800.00', label: 'Pagos pendientes' },
  ];

  readonly quickAccessItems: QuickAccessModel[] = [
    { icon: 'apartment', label: 'Establecimientos', path: '/establecimientos' },
    { icon: 'diamond', label: 'Planes', path: '/planes' },
    { icon: 'calendar_month', label: 'Cobranza', path: '/cobranza' },
    { icon: 'pie_chart', label: 'Reportes', path: '/reportes' },
  ];
}
