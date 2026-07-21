import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstablishmentChecklistEntry } from '../models/establishment-checklist-model';

const BASE_URL = `${environment.apiUrl}/establishment-checklist-items`;

@Injectable({ providedIn: 'root' })
export class EstablishmentChecklistService {
  private readonly http = inject(HttpClient);

  findChecklist(establishmentId: string): Observable<EstablishmentChecklistEntry[]> {
    return this.http.get<EstablishmentChecklistEntry[]>(`${BASE_URL}/getEstablishmentChecklist/${establishmentId}`);
  }

  upsertItem(
    establishmentId: string,
    itemTypeId: number,
    completed: boolean,
    file?: File,
  ): Observable<EstablishmentChecklistEntry> {
    const formData = new FormData();
    formData.set('completed', String(completed));
    if (file) {
      formData.set('file', file);
    }

    return this.http.put<EstablishmentChecklistEntry>(
      `${BASE_URL}/setEstablishmentChecklistItem/${establishmentId}/${itemTypeId}`,
      formData,
    );
  }
}
