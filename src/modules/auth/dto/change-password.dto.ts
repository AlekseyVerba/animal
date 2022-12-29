import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { IsTokenExistsAndActive } from "src/validations/tokenExistsAndActive.validation";
import { IsUserExistByEmail } from "src/validations/userExistByEmail.validation";

export class ChangePasswordDto {
    @IsUserExistByEmail({ message: 'User with email \'$value\' does not exist' })
    @IsEmail({}, { message: 'Field \'$property\' must be email' })
    email: string
    @IsString({ message: 'Field \'$property\' be string' })
    @MinLength(8, { message: 'Field \'$property\' length must be more then 8' })
    @MaxLength(16, { message: 'Field \'$property\' length must be less then 16' })
    password: string;
    @IsTokenExistsAndActive({ message: 'Current user does not have this token. Or token is not active' })
    code: string;
}