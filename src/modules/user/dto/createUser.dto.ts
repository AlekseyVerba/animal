import {
  IsEmail,
  IsString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: "Поле '$property' должно быть email" })
  email: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MinLength(8, {
    message: "Длина поля '$property' должна быть более 8 символов",
  })
  @MaxLength(16, {
    message: "Длина поля '$property' должно быть менее 16 символов",
  })
  password: string;
}
