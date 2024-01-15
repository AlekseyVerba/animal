import { IsUserExist } from 'src/validations/userExists.validation';

export class DeleteUserDto {
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  userUid: string;
}
