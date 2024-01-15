import { IsEmpty, IsOptional } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

export class GetProfileFollowersDto {
  @IsOptional()
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  user_uid?: string;

  @IsOptional()
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id?: string;

  @IsEmpty()
  uid?: string;
}
