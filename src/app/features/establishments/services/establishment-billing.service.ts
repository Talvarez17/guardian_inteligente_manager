import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstablishmentBilling, UpsertEstablishmentBillingPayload } from '../models/establishment-billing-model';

const BASE_URL = `${environment.apiUrl}/establishment-billing`;

@Injectable({ providedIn: 'root' })
export class EstablishmentBillingService {
  private readonly http = inject(HttpClient);

  upsert(establishmentId: string, payload: UpsertEstablishmentBillingPayload): Observable<EstablishmentBilling> {
    return this.http.put<EstablishmentBilling>(`${BASE_URL}/setEstablishmentBilling/${establishmentId}`, payload);
  }

  findByEstablishment(establishmentId: string): Observable<EstablishmentBilling> {
    return this.http.get<EstablishmentBilling>(`${BASE_URL}/getEstablishmentBilling/${establishmentId}`);
  }
}
