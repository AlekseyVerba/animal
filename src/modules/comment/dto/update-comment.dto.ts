import { IsOptional, IsString } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

export class UpdateCommentDto {
  @IsString()
  value: string;

  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  @IsOptional()
  reply_uid: string;

  commentId: number;

  current_uid: string;
}
