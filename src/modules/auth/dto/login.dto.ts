import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { IsUserExistByEmail } from "src/validations/userExistByEmail.validation";


export class LoginDto {
    @IsUserExistByEmail({ message: 'Incorrect data'})
    @IsEmail({}, { message: 'Field \'$property\' must be email' })
    email: string;
    @IsString({ message: 'Field \'$property\' be string' })
    @MinLength(8, { message: 'Field \'$property\' length must be more then 8' })
    @MaxLength(16, { message: 'Field \'$property\' length must be less then 16' })
    password: string;
}