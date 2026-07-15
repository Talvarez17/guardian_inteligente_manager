import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormField, apply, form } from '@angular/forms/signals';
import { PlanModel } from '../../models/plan-model';
import { PLAN_FEATURE_CATALOG, PLAN_REPEAT_UNIT_OPTIONS } from '../../models/plan-options';
import { PlansStore } from '../../services/plans-store';
import { positiveNumberSchema, requiredTextSchema } from '../../../../shared/forms/field-schemas';

type PlanFormModel = Omit<PlanModel, 'id'>;

function emptyModel(): PlanFormModel {
  return {
    name: '',
    amount: 0,
    repeatEvery: 1,
    repeatUnit: 'Mensual',
    trialDays: 0,
    retryAttempts: 3,
    notes: '',
    features: PLAN_FEATURE_CATALOG.map((label) => ({ label, included: false })),
  };
}

@Component({
  selector: 'app-plan-form-modal',
  imports: [FormField],
  templateUrl: './plan-form-modal.html',
})
export class PlanFormModal {
  private readonly store = inject(PlansStore);

  readonly repeatUnitOptions = PLAN_REPEAT_UNIT_OPTIONS;
  readonly featureCatalog = PLAN_FEATURE_CATALOG;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  readonly editingId = signal<string | null>(null);
  readonly model = signal<PlanFormModel>(emptyModel());

  readonly planForm = form(this.model, (f) => {
    apply(f.name, requiredTextSchema);
    apply(f.amount, positiveNumberSchema);
    apply(f.repeatEvery, positiveNumberSchema);
    apply(f.trialDays, positiveNumberSchema);
    apply(f.retryAttempts, positiveNumberSchema);
  });

  open(plan?: PlanModel): void {
    if (plan) {
      const { id, ...rest } = plan;
      this.editingId.set(id);
      this.model.set(rest);
    } else {
      this.editingId.set(null);
      this.model.set(emptyModel());
    }
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  isFeatureIncluded(label: string): boolean {
    return this.model().features.find((feature) => feature.label === label)?.included ?? false;
  }

  toggleFeature(label: string): void {
    this.model.update((current) => ({
      ...current,
      features: current.features.map((feature) =>
        feature.label === label ? { ...feature, included: !feature.included } : feature,
      ),
    }));
  }

  save(): void {
    if (this.planForm().invalid()) {
      this.planForm().markAsTouched();
      return;
    }

    const editingId = this.editingId();
    if (editingId) {
      this.store.update(editingId, this.model());
    } else {
      this.store.add({ id: crypto.randomUUID(), ...this.model() });
    }
    this.close();
  }
}
