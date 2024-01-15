import { IsEmail } from 'class-validator';
import { IsUserExistByEmail } from 'src/validations/userExistByEmail.validation';
import { IsTokenExistsAndActive } from 'src/validations/tokenExistsAndActive.validation';

export class RegistrationConfirmDto {
  @IsUserExistByEmail({
    message: "Пользователь с email '$value' не существует",
  })
  @IsEmail({}, { message: "Поле '$property' должно быть email" })
  email: string;
  @IsTokenExistsAndActive({
    message: 'Данный пользователь не имеет текущий код или токен не активен',
  })
  code: string;
}
