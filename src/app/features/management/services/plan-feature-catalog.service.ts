import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { paginateClientSide } from '../../../shared/utils/paginate-client-side';
import { CatalogAdapter, CatalogItem, CatalogUpdatePayload } from '../models/catalog-crud-model';

const BASE_URL = `${environment.apiUrl}/plan-feature`;

@Injectable({ providedIn: 'root' })
export class PlanFeatureCatalogService implements CatalogAdapter {
  private readonly http = inject(HttpClient);

  readonly key = 'plan-feature';
  readonly label = 'Característica de plan';
  readonly labelPlural = 'Características de plan';

  findAll(query: PaginationQuery): Observable<PaginatedResponse<CatalogItem>> {
    return this.http.get<CatalogItem[]>(`${BASE_URL}/getFeatures`).pipe(map((items) => paginateClientSide(items, query)));
  }

  create(name: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${BASE_URL}/createFeature`, { name });
  }

  update(id: number, payload: CatalogUpdatePayload): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${BASE_URL}/updateFeature/${id}`, payload);
  }
}
