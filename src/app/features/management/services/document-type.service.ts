import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CreateDocumentTypePayload, DocumentType, UpdateDocumentTypePayload } from '../models/document-type-model';

const BASE_URL = `${environment.apiUrl}/document-type`;

@Injectable({ providedIn: 'root' })
export class DocumentTypeService {
  private readonly http = inject(HttpClient);

  findAll(query: PaginationQuery): Observable<PaginatedResponse<DocumentType>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<DocumentType>>(`${BASE_URL}/getTypes`, { params });
  }

  create(payload: CreateDocumentTypePayload): Observable<DocumentType> {
    return this.http.post<DocumentType>(`${BASE_URL}/createType`, payload);
  }

  update(id: number, payload: UpdateDocumentTypePayload): Observable<DocumentType> {
    return this.http.patch<DocumentType>(`${BASE_URL}/updateType/${id}`, payload);
  }
}
