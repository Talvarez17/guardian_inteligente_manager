import { Observable } from 'rxjs';
import { PaginatedResponse, PaginationQuery } from '../../../core/models/pagination-model';

export interface CatalogItem {
  id: number;
  name: string;
  status: boolean;
}

export interface CatalogUpdatePayload {
  name?: string;
  status?: boolean;
}

export interface CatalogAdapter<T extends CatalogItem = CatalogItem> {
  readonly key: string;
  readonly label: string;
  readonly labelPlural: string;
  readonly icon: string;
  findAll(query: PaginationQuery): Observable<PaginatedResponse<T>>;
  create(name: string): Observable<T>;
  update(id: number, payload: CatalogUpdatePayload): Observable<T>;
}

export interface ItemFormModel {
  name: string;
}
