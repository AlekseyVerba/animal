import { IsEmail } from 'class-validator';

export class CheckUserByEmailDto {
  @IsEmail({}, { message: "Поле '$property' должно быть email" })
  email: string;
}
