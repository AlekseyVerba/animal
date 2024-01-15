import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsUserNotExistByEmail } from 'src/validations/userNotExistByEmail.validation';

export class RegistrationDto {
  @IsUserNotExistByEmail({ message: "User with email '$value' already exists" })
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
}
