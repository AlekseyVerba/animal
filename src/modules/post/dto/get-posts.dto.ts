import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

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
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id?: number;

  @IsOptional()
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  user_uid: string;

  current_uid: string;
}
