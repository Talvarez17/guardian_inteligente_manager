import { Injectable, signal } from '@angular/core';
import { EstablishmentModel } from '../models/establishment-model';

@Injectable({ providedIn: 'root' })
export class EstablishmentsStore {
  readonly establishments = signal<EstablishmentModel[]>([
    {
      id: 'adios-amor',
      tradeName: 'Adios Amor',
      legalName: 'Adios Amor Hospitality S.A. de C.V.',
      rfc: 'AAH210304AB1',
      street: 'Av. Insurgentes Sur',
      exteriorNumber: '1234',
      interiorNumber: '',
      neighborhood: 'Del Valle',
      state: 'Ciudad de México',
      municipality: 'Benito Juárez',
      postalCode: '03100',
      contactName: 'Ricardo Null',
      contactPhone: '55 1234 5678',
      email: 'contacto@adiosamor.mx',
      assignedManager: 'Mariana Torres',
      contractedPackage: 'Premium',
      monthlyFee: 1158.84,
      installedCameras: 6,
      notes: 'Cliente frecuente, buen historial de pago.',
      status: 'Activo',
      businessType: 'Bar',
      risk: 'Bajo',
      gia: true,
      covia: true,
    },
    {
      id: 'bar-la-selva',
      tradeName: 'Bar La Selva',
      legalName: 'Grupo La Selva S.A. de C.V.',
      rfc: 'GLS190812XY4',
      street: 'Calle Madero',
      exteriorNumber: '88',
      interiorNumber: '',
      neighborhood: 'Centro',
      state: 'Jalisco',
      municipality: 'Guadalajara',
      postalCode: '44100',
      contactName: 'Fernanda Ruiz',
      contactPhone: '33 9876 5432',
      email: 'admin@barlaselva.mx',
      assignedManager: 'Carlos Medina',
      contractedPackage: 'Bienvenida Plus',
      monthlyFee: 346.84,
      installedCameras: 4,
      notes: 'Pago por vencer este mes.',
      status: 'Activo',
      businessType: 'Bar',
      risk: 'Medio',
      gia: true,
      covia: false,
    },
    {
      id: 'big-bola-antea',
      tradeName: 'Big Bola Antea',
      legalName: 'Entretenimiento Antea S.A. de C.V.',
      rfc: 'EAN180501QW8',
      street: 'Blvd. Antea',
      exteriorNumber: '500',
      interiorNumber: 'L-12',
      neighborhood: 'Zibatá',
      state: 'Querétaro',
      municipality: 'Querétaro',
      postalCode: '76269',
      contactName: 'Jorge Salas',
      contactPhone: '442 111 2233',
      email: 'gerencia@bigbolaantea.mx',
      assignedManager: 'Ana Fernández',
      contractedPackage: 'Empresarial',
      monthlyFee: 4058.84,
      installedCameras: 12,
      notes: 'Mayor aforo registrado de la cartera.',
      status: 'Activo',
      businessType: 'Casino',
      risk: 'Alto',
      gia: true,
      covia: true,
    },
    {
      id: 'clinica-la-joya',
      tradeName: 'Clínica la Joya',
      legalName: 'Clínica la Joya S.C.',
      rfc: 'CLJ150922RT2',
      street: 'Av. Reforma',
      exteriorNumber: '300',
      interiorNumber: '4',
      neighborhood: 'Cuauhtémoc',
      state: 'Ciudad de México',
      municipality: 'Cuauhtémoc',
      postalCode: '06500',
      contactName: 'Dra. Patricia Núñez',
      contactPhone: '55 4455 6677',
      email: 'contacto@clinicalajoya.mx',
      assignedManager: 'Diego Salinas',
      contractedPackage: 'Premium',
      monthlyFee: 1158.84,
      installedCameras: 3,
      notes: 'Contrato próximo a renovar.',
      status: 'Activo',
      businessType: 'Clínica',
      risk: 'Bajo',
      gia: false,
      covia: true,
    },
  ]);

  getById(id: string): EstablishmentModel | undefined {
    return this.establishments().find((item) => item.id === id);
  }

  add(establishment: EstablishmentModel): void {
    this.establishments.update((items) => [...items, establishment]);
  }

  update(id: string, changes: Omit<EstablishmentModel, 'id'>): void {
    this.establishments.update((items) =>
      items.map((item) => (item.id === id ? { ...changes, id } : item)),
    );
  }
}
