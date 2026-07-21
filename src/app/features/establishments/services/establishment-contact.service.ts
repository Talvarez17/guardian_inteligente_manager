import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstablishmentContact, UpsertEstablishmentContactPayload } from '../models/establishment-contact-model';

const BASE_URL = `${environment.apiUrl}/establishment-contacts`;

@Injectable({ providedIn: 'root' })
export class EstablishmentContactService {
  private readonly http = inject(HttpClient);

  upsert(establishmentId: string, payload: UpsertEstablishmentContactPayload): Observable<EstablishmentContact> {
    return this.http.put<EstablishmentContact>(`${BASE_URL}/setEstablishmentContact/${establishmentId}`, payload);
  }

  findByEstablishment(establishmentId: string): Observable<EstablishmentContact> {
    return this.http.get<EstablishmentContact>(`${BASE_URL}/getEstablishmentContact/${establishmentId}`);
  }
}
