import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsPostExist } from 'src/validations/postExists.validation';

export class GetPostsDto {
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsEnum(['view', 'like', 'date'])
  orderBy?: 'view' | 'like' | 'date';

  @IsOptional()
  @IsEnum(['DESC', 'ASC'])
  order?: 'DESC' | 'ASC';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsPostExist()
  pet_id?: number;

  current_uid: string;
}
