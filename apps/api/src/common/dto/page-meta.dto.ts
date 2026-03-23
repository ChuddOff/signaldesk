export interface PaginationMetaDto {
  first: number;
  items: number;
  last: number;
  next: number | null;
  page: number;
  prev: number | null;
}
