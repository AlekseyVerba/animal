import { IsNumber, IsOptional } from 'class-validator';

export class GetCommentsQuery {
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
}
