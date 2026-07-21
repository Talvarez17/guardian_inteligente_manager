import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { FormField, apply, form, submit } from '@angular/forms/signals';
import { PlanFormValue, PlanModel } from '../../models/plan-model';
import { PLAN_FREQUENCY_OPTIONS } from '../../models/plan-options';
import { PlansService } from '../../services/plans.service';
import { PlanFeatureCatalogService } from '../../../management/services/plan-feature-catalog.service';
import { CatalogItem } from '../../../management/models/catalog-crud-model';
import { positiveNumberSchema, requiredTextSchema } from '../../../../shared/forms/field-schemas';
import { resolveErrorMessage } from '../../../../shared/utils/resolve-error-message';

function emptyModel(): PlanFormValue {
  return { name: '', amount: 0, frequency: 'Mensual', trial: 0, tries: 3, comments: '' };
}

@Component({
  selector: 'app-plan-form-modal',
  imports: [FormField],
  templateUrl: './plan-form-modal.html',
})
export class PlanFormModal {
  private readonly plansService = inject(PlansService);
  private readonly featureCatalogService = inject(PlanFeatureCatalogService);

  readonly saved = output<void>();

  readonly frequencyOptions = PLAN_FREQUENCY_OPTIONS;
  readonly featureCatalog = toSignal(this.featureCatalogService.findAll({}).pipe(map((response) => response.data)), {
    initialValue: [] as CatalogItem[],
  });
  readonly selectedFeatureIds = signal<number[]>([]);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<number | null>(null);
  readonly model = signal<PlanFormValue>(emptyModel());
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly planForm = form(this.model, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.amount, positiveNumberSchema);
    apply(f.trial, positiveNumberSchema);
    apply(f.tries, positiveNumberSchema);
  });

  open(plan?: PlanModel): void {
    this.errorMessage.set(null);

    if (plan) {
      this.editingId.set(plan.id);
      this.model.set({
        name: plan.name,
        amount: plan.amount,
        frequency: plan.frequency,
        trial: plan.trial,
        tries: plan.tries,
        comments: plan.comments,
      });
      this.selectedFeatureIds.set(plan.features.map((feature) => feature.id));
    } else {
      this.editingId.set(null);
      this.model.set(emptyModel());
      this.selectedFeatureIds.set([]);
    }

    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  isFeatureIncluded(id: number): boolean {
    return this.selectedFeatureIds().includes(id);
  }

  toggleFeature(id: number): void {
    this.selectedFeatureIds.update((ids) => (ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]));
  }

  async save(): Promise<void> {
    await submit(this.planForm, async () => {
      this.saving.set(true);
      this.errorMessage.set(null);

      try {
        const value = this.model();
        const editingId = this.editingId();

        if (editingId) {
          await firstValueFrom(
            this.plansService.update(editingId, {
              name: value.name,
              trial: value.trial,
              comments: value.comments,
              featureIds: this.selectedFeatureIds(),
            }),
          );
        } else {
          await firstValueFrom(
            this.plansService.create({
              name: value.name,
              amount: value.amount,
              currency: 'MXN',
              frequency: value.frequency,
              trial: value.trial,
              tries: value.tries,
              comments: value.comments,
              featureIds: this.selectedFeatureIds(),
            }),
          );
        }

        this.saved.emit();
        this.close();
      } catch (error) {
        this.errorMessage.set(resolveErrorMessage(error, 'No se pudo guardar el plan.'));
      } finally {
        this.saving.set(false);
      }
    });
  }
}
