import { PaginatedResponse, PaginationQuery } from '../../core/models/pagination-model';

/**
 * Normalizes a plain-array catalog endpoint (no server-side pagination, e.g. `turnover`, `plans`)
 * into the same PaginatedResponse shape used by paginated endpoints, applying search/paging client-side.
 */
export function paginateClientSide<T extends { name: string }>(
  items: T[],
  query: PaginationQuery,
): PaginatedResponse<T> {
  const page = query.page ?? 1;
  const limit = query.limit ?? (items.length || 1);
  const search = query.search?.trim().toLowerCase();

  const filtered = search ? items.filter((item) => item.name.toLowerCase().includes(search)) : items;

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}
