import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { PlanModel } from '../../models/plan-model';
import { PlansService } from '../../services/plans.service';
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
  private readonly plansService = inject(PlansService);
  private readonly featureCatalogService = inject(PlanFeatureCatalogService);

  readonly featureCatalog = toSignal(this.featureCatalogService.findAll({}).pipe(map((response) => response.data)), {
    initialValue: [] as CatalogItem[],
  });
  readonly togglingId = signal<number | null>(null);

  readonly modal = viewChild.required(PlanFormModal);

  private readonly plansResource = rxResource({
    stream: () =>
      this.plansService.findAll().pipe(
        map((plans) => ({ ok: true as const, plans })),
        catchError(() => of({ ok: false as const })),
      ),
  });

  readonly plans = computed<PlanModel[]>(() => {
    const result = this.plansResource.value();
    return result?.ok ? result.plans : [];
  });
  readonly loading = computed(() => this.plansResource.isLoading());
  readonly loadError = computed(() => {
    const result = this.plansResource.value();
    return result && !result.ok ? 'No se pudieron cargar los planes.' : null;
  });

  featureRows(plan: PlanModel): { name: string; included: boolean }[] {
    const includedIds = new Set(plan.features.map((feature) => feature.id));
    return this.featureCatalog().map((feature) => ({ name: feature.name, included: includedIds.has(feature.id) }));
  }

  openCreate(): void {
    this.modal().open();
  }

  openEdit(plan: PlanModel): void {
    this.modal().open(plan);
  }

  onSaved(): void {
    this.plansResource.reload();
  }

  async toggleStatus(plan: PlanModel): Promise<void> {
    this.togglingId.set(plan.id);
    try {
      await firstValueFrom(this.plansService.update(plan.id, { status: !plan.status }));
      this.plansResource.reload();
    } catch {
    } finally {
      this.togglingId.set(null);
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
