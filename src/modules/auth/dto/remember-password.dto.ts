import { IsEmail } from 'class-validator';
import { IsUserExistByEmail } from 'src/validations/userExistByEmail.validation';

export class RememberPasswordDto {
  @IsUserExistByEmail({
    message: "Пользователь с email '$value' не существует",
  })
  @IsEmail({}, { message: "Поле '$property' должно быть email" })
  email: string;
}
