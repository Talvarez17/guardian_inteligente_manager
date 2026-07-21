import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/pagination-model';
import { DesignatedPerson, Plan, Turnover } from '../models/establishment-model';
import { ClientRole } from '../models/establishment-contact-model';
import { PaymentForm, PaymentMethod } from '../models/establishment-billing-model';
import { ChecklistItemType } from '../models/establishment-checklist-model';

const CATALOG_PAGE_LIMIT = 100;

@Injectable({ providedIn: 'root' })
export class EstablishmentCatalogsService {
  private readonly http = inject(HttpClient);

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${environment.apiUrl}/plans/getPlans`);
  }

  getTurnovers(): Observable<Turnover[]> {
    return this.http.get<Turnover[]>(`${environment.apiUrl}/turnover/getTurnovers`);
  }

  getDesignatedPersons(): Observable<DesignatedPerson[]> {
    return this.http
      .get<PaginatedResponse<DesignatedPerson>>(`${environment.apiUrl}/users/getAll`, {
        params: { limit: CATALOG_PAGE_LIMIT },
      })
      .pipe(map((response) => response.data));
  }

  getClientRoles(): Observable<ClientRole[]> {
    return this.http
      .get<PaginatedResponse<ClientRole>>(`${environment.apiUrl}/client-roles/getClientRoles`, {
        params: { limit: CATALOG_PAGE_LIMIT },
      })
      .pipe(map((response) => response.data));
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http
      .get<PaginatedResponse<PaymentMethod>>(`${environment.apiUrl}/payment-methods/getPaymentMethods`, {
        params: { limit: CATALOG_PAGE_LIMIT },
      })
      .pipe(map((response) => response.data));
  }

  getPaymentForms(): Observable<PaymentForm[]> {
    return this.http
      .get<PaginatedResponse<PaymentForm>>(`${environment.apiUrl}/payment-forms/getPaymentForms`, {
        params: { limit: CATALOG_PAGE_LIMIT },
      })
      .pipe(map((response) => response.data));
  }

  getChecklistItemTypes(): Observable<ChecklistItemType[]> {
    return this.http
      .get<PaginatedResponse<ChecklistItemType>>(`${environment.apiUrl}/checklist-item-types/getChecklistItemTypes`, {
        params: { limit: CATALOG_PAGE_LIMIT },
      })
      .pipe(map((response) => response.data));
  }
}
