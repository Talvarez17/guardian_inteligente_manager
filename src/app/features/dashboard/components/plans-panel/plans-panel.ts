import { Component } from '@angular/core';
import { PlanItemModel } from '../../models/plan-item-model';

@Component({
  selector: 'app-plans-panel',
  templateUrl: './plans-panel.html',
})
export class PlansPanel {
  readonly plans: PlanItemModel[] = [
    { name: 'Bienvenida', description: 'Negocios pequeños', price: '$230.84' },
    { name: 'Bienvenida Plus', description: 'Negocios en crecimiento', price: '$346.84' },
    { name: 'Premium', description: 'Operación robusta', price: '$1,158.84' },
    { name: 'Empresarial', description: 'Corporativos y cadenas', price: '$4,058.84' },
  ];
}
