import { Component, computed, inject, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlanModel } from '../../models/plan-model';
import { PlansStore } from '../../services/plans-store';
import { PlanFormModal } from '../../components/plan-form-modal/plan-form-modal';

const IVA_RATE = 0.16;

const CARD_GRADIENTS = [
  'from-teal-400 to-blue-600',
  'from-blue-500 to-blue-800',
  'from-fuchsia-600 to-purple-700',
  'from-rose-500 to-orange-500',
];

@Component({
  selector: 'app-plans',
  imports: [DecimalPipe, PlanFormModal],
  templateUrl: './plans.html',
})
export class Plans {
  private readonly store = inject(PlansStore);

  readonly plans = computed(() => this.store.plans());

  readonly modal = viewChild.required(PlanFormModal);

  openCreate(): void {
    this.modal().open();
  }

  openEdit(plan: PlanModel): void {
    this.modal().open(plan);
  }

  removePlan(plan: PlanModel): void {
    if (confirm(`¿Eliminar el plan "${plan.name}"?`)) {
      this.store.remove(plan.id);
    }
  }

  ivaOf(amount: number): number {
    return amount * IVA_RATE;
  }

  totalOf(amount: number): number {
    return amount * (1 + IVA_RATE);
  }

  cardGradient(index: number): string {
    return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  }
}
