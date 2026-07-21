import { Component, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlanModel } from '../../models/plan-model';
import { PlansService } from '../../services/plans-service';
import { PlanFormModal } from '../../components/plan-form-modal/plan-form-modal';
import { PlanFeatureCatalogService } from '../../../management/services/plan-feature-catalog.service';
import { CatalogItem } from '../../../management/models/catalog-crud-model';

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
  private readonly store = inject(PlansService);
  private readonly featureCatalogService = inject(PlanFeatureCatalogService);

  readonly plans = signal<PlanModel[]>([]);
  readonly featureCatalog = signal<CatalogItem[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly togglingId = signal<number | null>(null);

  readonly modal = viewChild.required(PlanFormModal);

  constructor() {
    this.fetch();
    this.featureCatalogService.findAll({}).subscribe((response) => this.featureCatalog.set(response.data));
  }

  featureRows(plan: PlanModel): { name: string; included: boolean }[] {
    const includedIds = new Set(plan.features.map((feature) => feature.id));
    return this.featureCatalog().map((feature) => ({ name: feature.name, included: includedIds.has(feature.id) }));
  }

  private fetch(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.store.findAll().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudieron cargar los planes.');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.modal().open();
  }

  openEdit(plan: PlanModel): void {
    this.modal().open(plan);
  }

  onSaved(): void {
    this.fetch();
  }

  toggleStatus(plan: PlanModel): void {
    this.togglingId.set(plan.id);
    this.store.update(plan.id, { status: !plan.status }).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.fetch();
      },
      error: () => this.togglingId.set(null),
    });
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
