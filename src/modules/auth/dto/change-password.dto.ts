import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsTokenExistsAndActive } from 'src/validations/tokenExistsAndActive.validation';
import { IsUserExistByEmail } from 'src/validations/userExistByEmail.validation';

export class ChangePasswordDto {
  @IsUserExistByEmail({
    message: "Пользователь с email '$value' не существует",
  })
  @IsEmail({}, { message: "Поле '$property' должно быть email" })
  email: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MinLength(8, {
    message: "Длина поля '$property' должно быть более 8 символов",
  })
  @MaxLength(16, {
    message: "Длина поля '$property' должно быть менее 16 символов",
  })
  password: string;
  @IsTokenExistsAndActive({
    message: 'Данный пользователь не имеет текущий код или токен не активен',
  })
  code: string;
}
