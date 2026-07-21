import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CreateEstablishmentPayload, Establishment, UpdateEstablishmentPayload } from '../models/establishment-model';

const BASE_URL = `${environment.apiUrl}/establishment`;

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private readonly http = inject(HttpClient);

  create(payload: CreateEstablishmentPayload): Observable<Establishment> {
    return this.http.post<Establishment>(`${BASE_URL}/createEstablishment`, payload);
  }

  findAll(query: PaginationQuery): Observable<PaginatedResponse<Establishment>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Establishment>>(`${BASE_URL}/getEstablishments`, { params });
  }

  findOne(id: string): Observable<Establishment> {
    return this.http.get<Establishment>(`${BASE_URL}/getOneEstablishment/${id}`);
  }

  update(id: string, payload: UpdateEstablishmentPayload): Observable<Establishment> {
    return this.http.patch<Establishment>(`${BASE_URL}/updateEstablishment/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE_URL}/deleteEstablishment/${id}`);
  }
}
