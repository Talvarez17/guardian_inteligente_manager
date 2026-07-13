import { Component } from '@angular/core';
import { FaceItemModel } from '../../models/face-item-model';

@Component({
  selector: 'app-faces-panel',
  templateUrl: './faces-panel.html',
})
export class FacesPanel {
  readonly faces: FaceItemModel[] = [
    { name: 'Juan Pérez', place: 'Adios Amor', tag: 'Cliente frecuente', date: '15/05/2025 09:48 a. m.' },
    { name: 'María González', place: 'Adios Amor', tag: 'VIP', date: '14/05/2025 11:15 p. m.' },
    { name: 'Luis Herrera', place: 'Bar La Selva', tag: 'Colaborador', date: '15/05/2025 08:20 a. m.' },
    { name: 'Sofía Ramírez', place: 'Bar La Selva', tag: 'Cliente frecuente', date: '14/05/2025 10:42 p. m.' },
  ];
}
