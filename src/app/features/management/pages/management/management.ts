import { Component, computed, inject, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { CatalogCrud } from '../../components/catalog-crud/catalog-crud';
import { DocumentalAreaFormModal } from '../../components/documental-area-form-modal/documental-area-form-modal';
import { DocumentTypeFormModal } from '../../components/document-type-form-modal/document-type-form-modal';
import { TurnoverCatalogService } from '../../services/turnover-catalog.service';
import { ClientRoleCatalogService } from '../../services/client-role-catalog.service';
import { PaymentMethodCatalogService } from '../../services/payment-method-catalog.service';
import { PaymentFormCatalogService } from '../../services/payment-form-catalog.service';
import { ChecklistItemTypeCatalogService } from '../../services/checklist-item-type-catalog.service';
import { PlanFeatureCatalogService } from '../../services/plan-feature-catalog.service';
import { RoleCatalogService } from '../../services/role-catalog.service';
import { DocumentalAreaService } from '../../services/documental-area.service';
import { DocumentTypeService } from '../../services/document-type.service';
import { PaginatedResponse } from '../../../../core/models/pagination-model';

// Compact summary fetches the whole catalog (no server-side pagination) to compute accurate
// total/active/inactive counts, matching app-catalog-crud's compact mode.
const SUMMARY_FETCH_LIMIT = 100;

@Component({
  selector: 'app-management',
  imports: [RouterLink, CatalogCrud, DocumentalAreaFormModal, DocumentTypeFormModal],
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

  private readonly documentalAreaService = inject(DocumentalAreaService);
  private readonly documentTypeService = inject(DocumentTypeService);

  private readonly areaModal = viewChild.required(DocumentalAreaFormModal);
  private readonly typeModal = viewChild.required(DocumentTypeFormModal);

  readonly documentalAreasSummary = this.createSummary(() =>
    this.documentalAreaService.findAll({ limit: SUMMARY_FETCH_LIMIT }),
  );
  readonly documentTypesSummary = this.createSummary(() =>
    this.documentTypeService.findAll({ limit: SUMMARY_FETCH_LIMIT }),
  );

  openCreateArea(): void {
    this.areaModal().open();
  }

  onAreaSaved(): void {
    this.documentalAreasSummary.reload();
  }

  openCreateType(): void {
    this.typeModal().open();
  }

  onTypeSaved(): void {
    this.documentTypesSummary.reload();
  }

  private createSummary<T extends { status: boolean }>(fetch: () => Observable<PaginatedResponse<T>>) {
    const resource = rxResource({
      stream: () =>
        fetch().pipe(
          map((response) => ({ ok: true as const, response })),
          catchError(() => of({ ok: false as const })),
        ),
    });

    const items = computed(() => {
      const result = resource.value();
      return result?.ok ? result.response.data : [];
    });
    const total = computed(() => items().length);
    const active = computed(() => items().filter((item) => item.status).length);

    return {
      loading: computed(() => resource.isLoading()),
      error: computed(() => {
        const result = resource.value();
        return result && !result.ok ? 'No se pudo cargar la información.' : null;
      }),
      total,
      active,
      inactive: computed(() => total() - active()),
      reload: () => resource.reload(),
    };
  }
}
