import { IsOptional } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';
import { IsPostExist } from 'src/validations/postExists.validation';

export class DeleteLikeDto {
  current_uid: string;

  @IsOptional()
  @IsPostExist()
  postId?: number;

  @IsOptional()
  @IsCommentExist()
  commentId?: number;
}
