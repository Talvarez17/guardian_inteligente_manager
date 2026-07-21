import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CatalogAdapter, CatalogItem, CatalogUpdatePayload } from '../models/catalog-crud-model';

const BASE_URL = `${environment.apiUrl}/payment-forms`;

@Injectable({ providedIn: 'root' })
export class PaymentFormCatalogService implements CatalogAdapter {
  private readonly http = inject(HttpClient);

  readonly key = 'payment-forms';
  readonly label = 'Forma de pago';
  readonly labelPlural = 'Formas de pago';

  findAll(query: PaginationQuery): Observable<PaginatedResponse<CatalogItem>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<CatalogItem>>(`${BASE_URL}/getPaymentForms`, { params });
  }

  create(name: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${BASE_URL}/createPaymentForm`, { name });
  }

  update(id: number, payload: CatalogUpdatePayload): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(`${BASE_URL}/updatePaymentForm/${id}`, payload);
  }
}
