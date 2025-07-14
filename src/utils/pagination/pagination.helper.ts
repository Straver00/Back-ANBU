import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Applies a "before" cursor filter to a query based on a date column.
 *
 * @param query The query builder to modify
 * @param alias The alias of the table (e.g., "message")
 * @param column The column to filter (e.g., "created_at")
 * @param before ISO date string or Date
 */
export function applyBeforeCursor<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  alias: string,
  column: string,
  before?: string | Date,
): SelectQueryBuilder<T> {
  if (!before) return query;

  const date = before instanceof Date ? before : new Date(before);

  if (isNaN(date.getTime())) return query;

  return query.andWhere(`${alias}.${column} < :before`, {
    before: date.toISOString(),
  });
}

export function buildPaginatedResponse<T>(
  items: T[],
  take: number,
  cursorExtractor: (item: T) => string | Date,
): PaginatedResponse<T> {
  const hasMore = items.length > take;

  if (hasMore) {
    items.pop(); // remove extra
  }

  return {
    data: items.reverse(),
    meta: {
      count: items.length,
      hasMore,
      nextCursor: hasMore
        ? new Date(cursorExtractor(items[0])).toISOString()
        : undefined,
    },
  };
}
