import { IsEmail } from 'class-validator';

export class CheckUserByEmailDto {
  @IsEmail({}, { message: "Field '$property' must be email" })
  email: string;
}
