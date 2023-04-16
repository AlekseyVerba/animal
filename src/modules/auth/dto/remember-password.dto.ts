import { IsEmail } from 'class-validator';
import { IsUserExistByEmail } from 'src/validations/userExistByEmail.validation';

export class RememberPasswordDto {
  @IsUserExistByEmail({ message: "User with email '$value' does not exist" })
  @IsEmail({}, { message: "Field '$property' must be email" })
  email: string;
}
