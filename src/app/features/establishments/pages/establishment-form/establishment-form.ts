import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, apply, disabled, form } from '@angular/forms/signals';
import { EstablishmentModel } from '../../models/establishment-model';
import {
  STATUS_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  PACKAGE_OPTIONS,
  MANAGER_OPTIONS,
  RISK_OPTIONS,
} from '../../models/establishment-options';
import { EstablishmentsStore } from '../../services/establishments-store';
import { MEXICO_STATES, getMunicipalitiesByState } from '../../../../shared/data/mx-locations';
import {
  emailSchema,
  exteriorNumberSchema,
  interiorNumberSchema,
  phoneSchema,
  positiveNumberSchema,
  postalCodeSchema,
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

  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());

  readonly businessTypeOptions = BUSINESS_TYPE_OPTIONS;
  readonly managerOptions = MANAGER_OPTIONS;
  readonly packageOptions = PACKAGE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly riskOptions = RISK_OPTIONS;
  readonly stateOptions = MEXICO_STATES.map((state) => state.name);

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
    postalCode: '',
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
    disabled(f.municipality, ({ valueOf }) => valueOf(f.state) === '');
    apply(f.postalCode, postalCodeSchema);
    apply(f.contactName, requiredTextSchema);
    apply(f.contactPhone, phoneSchema);
    apply(f.email, emailSchema);
    apply(f.monthlyFee, positiveNumberSchema);
    apply(f.installedCameras, positiveNumberSchema);
  });

  readonly municipalityOptions = computed(() => getMunicipalitiesByState(this.model().state));

  private readonly loadExistingOnEdit = effect(() => {
    const id = this.id();
    if (!id) {
      return;
    }
    const existing = this.store.getById(id);
    if (existing) {
      const { id: _id, ...rest } = existing;
      this.model.set(rest);
    }
  });

  private readonly resetMunicipalityOnStateChange = effect(() => {
    const options = this.municipalityOptions();
    const current = this.model().municipality;
    if (current && !options.includes(current)) {
      this.model.update((value) => ({ ...value, municipality: '' }));
    }
  });

  save(): void {
    if (this.establishmentForm().invalid()) {
      this.establishmentForm().markAsTouched();
      return;
    }

    const id = this.id();
    if (id) {
      this.store.update(id, this.model());
    } else {
      this.store.add({ id: this.slugify(this.model().tradeName), ...this.model() });
    }
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
