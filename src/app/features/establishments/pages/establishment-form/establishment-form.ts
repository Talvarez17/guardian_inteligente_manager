import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, apply, form } from '@angular/forms/signals';
import { EstablishmentModel } from '../../models/establishment-model';
import {
  STATUS_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  PACKAGE_OPTIONS,
  MANAGER_OPTIONS,
  RISK_OPTIONS,
} from '../../models/establishment-options';
import { EstablishmentsStore } from '../../services/establishments-store';
import {
  emailSchema,
  exteriorNumberSchema,
  interiorNumberSchema,
  phoneSchema,
  positiveNumberSchema,
  requiredTextSchema,
  rfcSchema,
} from '../../../../shared/forms/field-schemas';

type EstablishmentFormModel = Omit<EstablishmentModel, 'id'>;

@Component({
  selector: 'app-establishment-form',
  imports: [RouterLink, FormField],
  templateUrl: './establishment-form.html',
})
export class EstablishmentForm {
  private readonly router = inject(Router);
  private readonly store = inject(EstablishmentsStore);

  readonly businessTypeOptions = BUSINESS_TYPE_OPTIONS;
  readonly managerOptions = MANAGER_OPTIONS;
  readonly packageOptions = PACKAGE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly riskOptions = RISK_OPTIONS;

  readonly model = signal<EstablishmentFormModel>({
    tradeName: '',
    legalName: '',
    rfc: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    state: '',
    municipality: '',
    contactName: '',
    contactPhone: '',
    email: '',
    assignedManager: MANAGER_OPTIONS[0],
    contractedPackage: PACKAGE_OPTIONS[0],
    monthlyFee: 0,
    installedCameras: 0,
    notes: '',
    status: 'Prospecto',
    businessType: BUSINESS_TYPE_OPTIONS[0],
    risk: 'Bajo',
    gia: false,
    covia: false,
  });

  readonly establishmentForm = form(this.model, (f) => {
    apply(f.tradeName, requiredTextSchema);
    apply(f.legalName, requiredTextSchema);
    apply(f.rfc, rfcSchema);
    apply(f.street, requiredTextSchema);
    apply(f.exteriorNumber, exteriorNumberSchema);
    apply(f.interiorNumber, interiorNumberSchema);
    apply(f.neighborhood, requiredTextSchema);
    apply(f.state, requiredTextSchema);
    apply(f.municipality, requiredTextSchema);
    apply(f.contactName, requiredTextSchema);
    apply(f.contactPhone, phoneSchema);
    apply(f.email, emailSchema);
    apply(f.monthlyFee, positiveNumberSchema);
    apply(f.installedCameras, positiveNumberSchema);
  });

  save(): void {
    if (this.establishmentForm().invalid()) {
      this.establishmentForm().markAsTouched();
      return;
    }

    this.store.add({ id: this.slugify(this.model().tradeName), ...this.model() });
    this.router.navigate(['/establecimientos']);
  }

  private slugify(value: string): string {
    const diacritics = new RegExp(String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f), 'g');
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(diacritics, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  cancel(): void {
    this.router.navigate(['/establecimientos']);
  }
}
