import { IsNumber, IsOptional } from 'class-validator';

export class GetMyFavoriteProjectsDTO {
  current_uid: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
}
