import { PaginationMeta } from './page-meta.type';

export type PaginatedResult<T> = {
  data: T[];
} & PaginationMeta;
