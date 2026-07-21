import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { EstablishmentService } from '../../../../services/establishment.service';
import { EstablishmentCatalogsService } from '../../../../services/establishment-catalogs.service';
import { DesignatedPerson, EstablishmentStatus, Plan, Turnover } from '../../../../models/establishment-model';
import { ESTABLISHMENT_STATUS_LABELS, ESTABLISHMENT_STATUS_OPTIONS } from '../../../../models/establishment-options';
import { CoreModel } from '../../../../models/establishment-wizard-model';
import { MEXICO_STATES, getMunicipalitiesByState } from '../../../../../../shared/data/mx-locations';
import {exteriorNumberSchema,interiorNumberSchema,postalCodeSchema,requiredTextSchema,rfcSchema} from '../../../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../../../shared/utils/resolve-error-message';

function emptyCoreModel(): CoreModel {
  return {
    name: '',
    business_name: '',
    rfc: '',
    turnover_id: 0,
    street: '',
    neighborhood: '',
    ext_number: '',
    int_number: '',
    postal_code: '',
    state: '',
    city: '',
    designated_person_id: '',
    plan_id: 0,
    establishment_status: EstablishmentStatus.PROSPECT,
    comment: '',
  };
}

@Component({
  selector: 'app-establishment-step-general',
  imports: [FormField],
  templateUrl: './step-general.html',
})
export class EstablishmentStepGeneral {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly catalogs = inject(EstablishmentCatalogsService);

  readonly establishmentId = input<string | null>(null);
  readonly saved = output<string>();
  readonly cancelled = output<void>();

  readonly statusOptions = ESTABLISHMENT_STATUS_OPTIONS;
  readonly statusLabels = ESTABLISHMENT_STATUS_LABELS;
  readonly stateOptions = MEXICO_STATES.map((state) => state.name);
  readonly cityOptions = computed(() => getMunicipalitiesByState(this.coreModel().state));

  readonly plans = signal<Plan[]>([]);
  readonly turnovers = signal<Turnover[]>([]);
  readonly designatedPersons = signal<DesignatedPerson[]>([]);

  readonly coreModel = signal<CoreModel>(emptyCoreModel());
  readonly coreForm = form(this.coreModel, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.business_name, requiredTextSchema);
    apply(f.rfc, rfcSchema);
    apply(f.street, requiredTextSchema);
    apply(f.neighborhood, requiredTextSchema);
    apply(f.ext_number, exteriorNumberSchema);
    apply(f.int_number, interiorNumberSchema);
    apply(f.postal_code, postalCodeSchema);
    apply(f.state, requiredTextSchema);
    apply(f.city, requiredTextSchema);
    apply(f.designated_person_id, requiredTextSchema);
  });
  readonly turnoverTouched = signal(false);
  readonly planTouched = signal(false);
  readonly savingCore = signal(false);
  readonly coreError = signal<string | null>(null);

  private readonly resetCityOnStateChange = effect(() => {
    const options = this.cityOptions();
    const current = this.coreModel().city;
    if (current && !options.includes(current)) {
      this.coreModel.update((value) => ({ ...value, city: '' }));
    }
  });

  private readonly loadExisting = effect(() => {
    const id = this.establishmentId();
    if (!id) return;

    this.establishmentService.findOne(id).subscribe((establishment) => {
      this.coreModel.set({
        name: establishment.name,
        business_name: establishment.business_name,
        rfc: establishment.rfc,
        turnover_id: establishment.turnover.id,
        street: establishment.street,
        neighborhood: establishment.neighborhood,
        ext_number: establishment.ext_number,
        int_number: establishment.int_number ?? '',
        postal_code: establishment.postal_code,
        state: establishment.state,
        city: establishment.city,
        designated_person_id: establishment.designated_person.id,
        plan_id: establishment.plan.id,
        establishment_status: establishment.establishment_status,
        comment: establishment.comment ?? '',
      });
    });
  });

  constructor() {
    this.catalogs.getPlans().subscribe((plans) => this.plans.set(plans));
    this.catalogs.getTurnovers().subscribe((turnovers) => this.turnovers.set(turnovers));
    this.catalogs.getDesignatedPersons().subscribe((persons) => this.designatedPersons.set(persons));
  }

  onTurnoverChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.coreModel.update((m) => ({ ...m, turnover_id: value }));
    this.turnoverTouched.set(true);
  }

  onPlanChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.coreModel.update((m) => ({ ...m, plan_id: value }));
    this.planTouched.set(true);
  }

  async save(): Promise<void> {
    await submit(this.coreForm, async () => {
      this.turnoverTouched.set(true);
      this.planTouched.set(true);
      if (this.coreModel().turnover_id === 0 || this.coreModel().plan_id === 0) {
        return;
      }

      this.savingCore.set(true);
      this.coreError.set(null);

      try {
        const payload = this.coreModel();
        const existingId = this.establishmentId();
        const establishment = existingId
          ? await firstValueFrom(this.establishmentService.update(existingId, payload))
          : await firstValueFrom(this.establishmentService.create(payload));
        this.saved.emit(establishment.id);
      } catch (error) {
        this.coreError.set(resolveErrorMessage(error));
      } finally {
        this.savingCore.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
