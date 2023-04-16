import { IsUserExist } from 'src/validations/userExists.validation';

export class DeleteUserDto {
  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  userUid: string;
}
