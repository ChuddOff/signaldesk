import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class HealthBodyDto {
  @IsNumber()
  @IsNotEmpty()
  body: number;
}

export class HealthQueryDto {
  @IsString()
  @IsOptional()
  query: string;
}

export class HealthParamsDto {
  @IsString()
  @IsOptional()
  params: string;
}
