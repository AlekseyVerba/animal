import { IsEmail, IsString, Min, Max } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Field \'$property\' must be email' })
    email: string;
    @IsString({ message: 'Field \'$property\' be string' })
    @Min(8, { message: 'Field \'$property\' length must be more then 8' })
    @Max(16, { message: 'Field \'$property\' length must be less then 16' })
    password: string;
}