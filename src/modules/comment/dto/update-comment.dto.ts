import { IsOptional, IsString } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

export class UpdateCommentDto {
  @IsString()
  value: string;

  @IsUserExist({ message: "Пользователь с uid '$value' не существует" })
  @IsOptional()
  reply_uid: string;

  commentId: number;

  current_uid: string;
}
