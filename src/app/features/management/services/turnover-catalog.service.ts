import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { paginateClientSide } from '../../../shared/utils/paginate-client-side';
import { CatalogAdapter, CatalogItem, CatalogUpdatePayload } from '../models/catalog-crud-model';

const BASE_URL = `${environment.apiUrl}/turnover`;

@Injectable({ providedIn: 'root' })
export class TurnoverCatalogService implements CatalogAdapter {
  private readonly http = inject(HttpClient);

  readonly key = 'turnover';
  readonly label = 'Giro comercial';
  readonly labelPlural = 'Giros comerciales';
  readonly icon = 'storefront';

  findAll(query: PaginationQuery): Observable<PaginatedResponse<CatalogItem>> {
    return this.http.get<CatalogItem[]>(`${BASE_URL}/getTurnovers`).pipe(map((items) => paginateClientSide(items, query)));
  }

  create(name: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${BASE_URL}/createTurnover`, { name });
  }

  update(id: number, payload: CatalogUpdatePayload): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${BASE_URL}/updateTurnover/${id}`, payload);
  }
}
