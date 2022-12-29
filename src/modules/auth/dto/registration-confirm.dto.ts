import { IsEmail } from 'class-validator';
import { IsUserExistByEmail } from 'src/validations/userExistByEmail.validation';
import { IsTokenExistsAndActive } from 'src/validations/tokenExistsAndActive.validation'

export class RegistrationConfirmDto {
    @IsUserExistByEmail({ message: 'User with email \'$value\' does not exist' })
    @IsEmail({}, { message: 'Field \'$property\' must be email' })
    email: string;
    @IsTokenExistsAndActive({ message: 'Current user does not have this token. Or token is not active' })
    code: string;
}