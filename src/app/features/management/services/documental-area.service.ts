import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CreateDocumentalAreaPayload, DocumentalArea, UpdateDocumentalAreaPayload } from '../models/documental-area-model';

const BASE_URL = `${environment.apiUrl}/documental-area`;

@Injectable({ providedIn: 'root' })
export class DocumentalAreaService {
  private readonly http = inject(HttpClient);

  findAll(query: PaginationQuery): Observable<PaginatedResponse<DocumentalArea>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<DocumentalArea>>(`${BASE_URL}/getAreas`, { params });
  }

  create(payload: CreateDocumentalAreaPayload): Observable<DocumentalArea> {
    return this.http.post<DocumentalArea>(`${BASE_URL}/createArea`, payload);
  }

  update(id: number, payload: UpdateDocumentalAreaPayload): Observable<DocumentalArea> {
    return this.http.patch<DocumentalArea>(`${BASE_URL}/updateArea/${id}`, payload);
  }
}
