import { IsUserExist } from 'src/validations/userExists.validation';

export class GetProfileUserDto {
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  user_uid: string;
}
