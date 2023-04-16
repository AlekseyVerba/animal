import { IsEmpty } from 'class-validator';
import { IsUserExist } from 'src/validations/userExists.validation';

export class FollowAndUnfollowUserDto {
  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  user_uid: string;
  @IsEmpty()
  current_uid: string;
}
