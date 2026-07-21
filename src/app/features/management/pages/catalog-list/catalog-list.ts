import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogCrud } from '../../components/catalog-crud/catalog-crud';
import { CatalogAdapter } from '../../models/catalog-crud-model';
import { TurnoverCatalogService } from '../../services/turnover-catalog.service';
import { ClientRoleCatalogService } from '../../services/client-role-catalog.service';
import { PaymentMethodCatalogService } from '../../services/payment-method-catalog.service';
import { PaymentFormCatalogService } from '../../services/payment-form-catalog.service';
import { ChecklistItemTypeCatalogService } from '../../services/checklist-item-type-catalog.service';
import { PlanFeatureCatalogService } from '../../services/plan-feature-catalog.service';
import { RoleCatalogService } from '../../services/role-catalog.service';

@Component({
  selector: 'app-catalog-list',
  imports: [RouterLink, CatalogCrud],
  templateUrl: './catalog-list.html',
})
export class CatalogList {
  private readonly turnoverCatalog = inject(TurnoverCatalogService);
  private readonly clientRoleCatalog = inject(ClientRoleCatalogService);
  private readonly paymentMethodCatalog = inject(PaymentMethodCatalogService);
  private readonly paymentFormCatalog = inject(PaymentFormCatalogService);
  private readonly checklistItemTypeCatalog = inject(ChecklistItemTypeCatalogService);
  private readonly planFeatureCatalog = inject(PlanFeatureCatalogService);
  private readonly roleCatalog = inject(RoleCatalogService);

  private readonly catalogsByKey: Record<string, CatalogAdapter> = {
    [this.turnoverCatalog.key]: this.turnoverCatalog,
    [this.clientRoleCatalog.key]: this.clientRoleCatalog,
    [this.paymentMethodCatalog.key]: this.paymentMethodCatalog,
    [this.paymentFormCatalog.key]: this.paymentFormCatalog,
    [this.checklistItemTypeCatalog.key]: this.checklistItemTypeCatalog,
    [this.planFeatureCatalog.key]: this.planFeatureCatalog,
    [this.roleCatalog.key]: this.roleCatalog,
  };

  readonly catalogId = input.required<string>();
  readonly adapter = computed(() => this.catalogsByKey[this.catalogId()] ?? null);
}
