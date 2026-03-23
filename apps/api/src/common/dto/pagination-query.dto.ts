import { IsNumber, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @Min(1)
  p: number;

  @IsNumber()
  @Min(1)
  per_page: number;
}
