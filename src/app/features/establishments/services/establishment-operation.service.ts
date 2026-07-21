import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstablishmentOperation, UpsertEstablishmentOperationPayload } from '../models/establishment-operation-model';

const BASE_URL = `${environment.apiUrl}/establishment-operations`;

@Injectable({ providedIn: 'root' })
export class EstablishmentOperationService {
  private readonly http = inject(HttpClient);

  upsert(establishmentId: string, payload: UpsertEstablishmentOperationPayload): Observable<EstablishmentOperation> {
    return this.http.put<EstablishmentOperation>(`${BASE_URL}/setEstablishmentOperation/${establishmentId}`, payload);
  }

  findByEstablishment(establishmentId: string): Observable<EstablishmentOperation> {
    return this.http.get<EstablishmentOperation>(`${BASE_URL}/getEstablishmentOperation/${establishmentId}`);
  }
}
