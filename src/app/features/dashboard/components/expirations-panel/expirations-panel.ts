import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpirationModel } from '../../models/expiration-model';

@Component({
  selector: 'app-expirations-panel',
  imports: [RouterLink],
  templateUrl: './expirations-panel.html',
})
export class ExpirationsPanel {
  readonly expirations: ExpirationModel[] = [
    { title: 'Constancia de situación fiscal', entity: 'Adios Amor', establishmentId: 'adios-amor', date: '02/05/2026', type: 'Otro', status: 'Vigente', ext: 'PDF' },
    { title: 'Estado de cuenta por establecimiento', entity: 'Adios Amor', establishmentId: 'adios-amor', date: '14/06/2025', type: 'Factura', status: 'Por vencer', ext: 'XLSX' },
    { title: 'Contrato de prestación de servicios', entity: 'Clínica la Joya', establishmentId: 'clinica-la-joya', date: '12/03/2026', type: 'Contrato', status: 'Vigente', ext: 'DOCX' },
    { title: 'Bitácora de cobranza mensual', entity: 'Adios Amor', establishmentId: 'adios-amor', date: '13/06/2025', type: 'Otro', status: 'Vigente', ext: 'PDF' },
    { title: 'Contrato_ClinicaLaJoya_2025.pdf', entity: 'Clínica la Joya', establishmentId: 'clinica-la-joya', date: '12/03/2026', type: 'Contrato', status: 'Vigente', ext: 'PDF' },
  ];

  extBadgeClass(ext: ExpirationModel['ext']): string {
    switch (ext) {
      case 'PDF':
        return 'bg-error/10 text-error';
      case 'XLSX':
        return 'bg-success/10 text-success';
      case 'DOCX':
        return 'bg-primary/10 text-primary';
    }
  }

  statusBadgeClass(status: ExpirationModel['status']): string {
    return status === 'Vigente' ? 'badge-success' : 'badge-warning';
  }
}
