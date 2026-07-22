import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CreateDocumentPayload, Document, UpdateDocumentPayload } from '../models/document-model';

const BASE_URL = `${environment.apiUrl}/documents`;

function toFormData(payload: CreateDocumentPayload | UpdateDocumentPayload, file?: File): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      formData.set(key, String(value));
    }
  }
  if (file) {
    formData.set('file', file);
  }
  return formData;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);

  findAllByEstablishment(establishmentId: string, query: PaginationQuery): Observable<PaginatedResponse<Document>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Document>>(`${BASE_URL}/getDocumentsByEstablishment/${establishmentId}`, { params });
  }

  create(payload: CreateDocumentPayload, file: File): Observable<Document> {
    return this.http.post<Document>(`${BASE_URL}/createDocument`, toFormData(payload, file));
  }

  update(id: number, payload: UpdateDocumentPayload, file?: File): Observable<Document> {
    return this.http.patch<Document>(`${BASE_URL}/updateDocument/${id}`, toFormData(payload, file));
  }

  removePermanently(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE_URL}/deleteDocumentPermanently/${id}`);
  }
}
