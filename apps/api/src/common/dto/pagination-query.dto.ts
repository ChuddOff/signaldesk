import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  p: number = 1;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  per_page: number = 20;
}
