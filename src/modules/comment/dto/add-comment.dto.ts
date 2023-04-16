import { IsString } from 'class-validator';
import { IsPostExist } from 'src/validations/postExists.validation';

export class AddCommentDto {
  @IsString()
  value: string;

  postId: number;

  current_uid: string;
}
