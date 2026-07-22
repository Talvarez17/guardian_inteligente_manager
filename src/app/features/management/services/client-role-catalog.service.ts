import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CatalogAdapter, CatalogItem, CatalogUpdatePayload } from '../models/catalog-crud-model';

const BASE_URL = `${environment.apiUrl}/client-roles`;

@Injectable({ providedIn: 'root' })
export class ClientRoleCatalogService implements CatalogAdapter {
  private readonly http = inject(HttpClient);

  readonly key = 'client-roles';
  readonly label = 'Cargo de contacto';
  readonly labelPlural = 'Cargos de contacto';

  findAll(query: PaginationQuery): Observable<PaginatedResponse<CatalogItem>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<CatalogItem>>(`${BASE_URL}/getClientRoles`, { params });
  }

  create(name: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${BASE_URL}/createClientRole`, { name });
  }

  update(id: number, payload: CatalogUpdatePayload): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${BASE_URL}/updateClientRole/${id}`, payload);
  }
}
