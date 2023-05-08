import { IsOptional, IsString } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';
import { IsPostExist } from 'src/validations/postExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

export class AddCommentDto {
  @IsString()
  value: string;

  @IsCommentExist()
  @IsOptional()
  parent_id?: number;

  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  @IsOptional()
  reply_uid?: string;

  @IsPostExist()
  @IsOptional()
  postId: number;

  current_uid: string;
}
