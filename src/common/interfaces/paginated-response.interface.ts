export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    count: number;
    hasMore: boolean;
    nextCursor?: string | number | Date;
  };
}
