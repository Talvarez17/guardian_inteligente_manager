import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogCrud } from '../../components/catalog-crud/catalog-crud';
import { TurnoverCatalogService } from '../../services/turnover-catalog.service';
import { ClientRoleCatalogService } from '../../services/client-role-catalog.service';
import { PaymentMethodCatalogService } from '../../services/payment-method-catalog.service';
import { PaymentFormCatalogService } from '../../services/payment-form-catalog.service';
import { ChecklistItemTypeCatalogService } from '../../services/checklist-item-type-catalog.service';
import { PlanFeatureCatalogService } from '../../services/plan-feature-catalog.service';
import { RoleCatalogService } from '../../services/role-catalog.service';

@Component({
  selector: 'app-management',
  imports: [RouterLink, CatalogCrud],
  templateUrl: './management.html',
})
export class Management {
  readonly turnoverCatalog = inject(TurnoverCatalogService);
  readonly clientRoleCatalog = inject(ClientRoleCatalogService);
  readonly paymentMethodCatalog = inject(PaymentMethodCatalogService);
  readonly paymentFormCatalog = inject(PaymentFormCatalogService);
  readonly checklistItemTypeCatalog = inject(ChecklistItemTypeCatalogService);
  readonly planFeatureCatalog = inject(PlanFeatureCatalogService);
  readonly roleCatalog = inject(RoleCatalogService);
}
