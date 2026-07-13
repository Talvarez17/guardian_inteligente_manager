import { Component } from '@angular/core';
import { CapacityItemModel } from '../../models/capacity-item-model';

@Component({
  selector: 'app-capacity-panel',
  templateUrl: './capacity-panel.html',
})
export class CapacityPanel {
  readonly capacity: CapacityItemModel[] = [
    { name: 'Adios Amor', current: 124, total: 180, percent: 69, topRange: '22:00 - 23:00' },
    { name: 'Bar La Selva', current: 96, total: 140, percent: 69, topRange: '21:00 - 22:00' },
    { name: 'Big Bola Antea', current: 160, total: 220, percent: 73, topRange: '20:00 - 21:00' },
    { name: 'Clínica la Joya', current: 38, total: 90, percent: 42, topRange: '12:00 - 13:00' },
  ];
}
