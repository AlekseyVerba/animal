import { IsUserExist } from 'src/validations/userExists.validation';

export class GetProfileUserDto {
  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  user_uid: string;
}
