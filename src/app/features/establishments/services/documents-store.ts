import { Injectable, signal } from '@angular/core';
import { DocumentModel } from '../models/document-model';

@Injectable({ providedIn: 'root' })
export class DocumentsStore {
  readonly documents = signal<DocumentModel[]>([
    {
      id: 'doc-adios-amor-rfc',
      establishmentId: 'adios-amor',
      name: 'Constancia de situación fiscal',
      area: 'Fiscal',
      version: 'v1',
      status: 'Vigente',
      expirationDate: '2026-12-31',
      notes: 'Emitida por el SAT, vigente para el ejercicio actual.',
      fileName: 'constancia-fiscal-adios-amor.pdf',
    },
    {
      id: 'doc-adios-amor-permiso',
      establishmentId: 'adios-amor',
      name: 'Permiso de funcionamiento',
      area: 'Legal',
      version: 'v2',
      status: 'Por vencer',
      expirationDate: '2026-08-15',
      notes: 'Renovar antes de la fecha de vencimiento con el municipio.',
      fileName: 'permiso-funcionamiento-adios-amor.pdf',
    },
    {
      id: 'doc-bar-la-selva-camaras',
      establishmentId: 'bar-la-selva',
      name: 'Bitácora de instalación de cámaras',
      area: 'Operativo',
      version: 'v1',
      status: 'Vencido',
      expirationDate: '2025-11-01',
      notes: 'Pendiente de actualizar tras la última visita técnica.',
      fileName: 'bitacora-camaras-la-selva.pdf',
    },
  ]);

  listByEstablishment(establishmentId: string): DocumentModel[] {
    return this.documents().filter((item) => item.establishmentId === establishmentId);
  }

  getById(id: string): DocumentModel | undefined {
    return this.documents().find((item) => item.id === id);
  }

  add(document: DocumentModel): void {
    this.documents.update((items) => [...items, document]);
  }

  update(id: string, changes: Omit<DocumentModel, 'id'>): void {
    this.documents.update((items) => items.map((item) => (item.id === id ? { ...changes, id } : item)));
  }

  remove(id: string): void {
    this.documents.update((items) => items.filter((item) => item.id !== id));
  }
}
