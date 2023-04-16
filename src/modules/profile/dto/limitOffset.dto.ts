import { IsNumber, IsOptional } from 'class-validator';

export class LimitOffsetDto {
  @IsOptional()
  limit: number;
  @IsOptional()
  offset: number;
}
