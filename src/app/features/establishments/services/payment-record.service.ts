import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';
import { CreatePaymentRecordPayload, PaymentRecord, PaymentSummary, UpdatePaymentRecordPayload } from '../models/payment-record-model';

const BASE_URL = `${environment.apiUrl}/payment-records`;

@Injectable({ providedIn: 'root' })
export class PaymentRecordService {
  private readonly http = inject(HttpClient);

  create(payload: CreatePaymentRecordPayload): Observable<PaymentRecord> {
    return this.http.post<PaymentRecord>(`${BASE_URL}/createPaymentRecord`, payload);
  }

  findAllByEstablishment(establishmentId: string, query: PaginationQuery): Observable<PaginatedResponse<PaymentRecord>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<PaymentRecord>>(`${BASE_URL}/getPaymentRecords/${establishmentId}`, { params });
  }

  getSummary(establishmentId: string): Observable<PaymentSummary> {
    return this.http.get<PaymentSummary>(`${BASE_URL}/getPaymentSummary/${establishmentId}`);
  }

  update(id: number, payload: UpdatePaymentRecordPayload): Observable<PaymentRecord> {
    return this.http.patch<PaymentRecord>(`${BASE_URL}/updatePaymentRecord/${id}`, payload);
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE_URL}/deletePaymentRecord/${id}`);
  }
}
