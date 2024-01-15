import { IsEmpty } from 'class-validator';
import { IsUserExist } from 'src/validations/userExists.validation';

export class FollowAndUnfollowUserDto {
  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  user_uid: string;
  @IsEmpty()
  current_uid: string;
}
