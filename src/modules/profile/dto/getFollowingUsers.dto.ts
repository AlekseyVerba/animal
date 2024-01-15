import { IsUserExist } from 'src/validations/userExists.validation';
import { IsEmpty, IsOptional, IsNumber } from 'class-validator';

export class GetFollowingUsersDto {
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  user_uid: string;

  @IsEmpty()
  uid: string;
}
