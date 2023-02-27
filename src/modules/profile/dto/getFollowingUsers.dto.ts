import { IsUserExist } from 'src/validations/userExists.validation';
import { IsEmpty, IsOptional, IsNumber } from "class-validator";

export class GetFollowingUsersDto {
    @IsUserExist({ message: 'User with uid \'$value\' does not exist!' })
    user_uid: string;

    @IsEmpty()
    uid: string
}