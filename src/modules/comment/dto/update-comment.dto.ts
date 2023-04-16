import { IsString } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';

export class UpdateCommentDto {
  @IsString()
  value: string;

  commentId: number;

  current_uid: string;
}
