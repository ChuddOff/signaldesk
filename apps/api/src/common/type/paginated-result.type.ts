import { PaginationMetaDto } from '../dto/page-meta.dto';

export type PaginatedResult<T> = {
  items: T[];
} & PaginationMetaDto;
