import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePlanPayload, PlanModel, UpdatePlanPayload } from '../models/plan-model';

const BASE_URL = `${environment.apiUrl}/plans`;

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<PlanModel[]> {
    return this.http.get<PlanModel[]>(`${BASE_URL}/getPlans`);
  }

  create(payload: CreatePlanPayload): Observable<PlanModel> {
    return this.http.post<PlanModel>(`${BASE_URL}/createPlan`, payload);
  }

  update(id: number, payload: UpdatePlanPayload): Observable<PlanModel> {
    return this.http.patch<PlanModel>(`${BASE_URL}/updatePlan/${id}`, payload);
  }
}
