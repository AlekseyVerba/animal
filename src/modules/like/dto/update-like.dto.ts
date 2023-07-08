import { IsEnum, IsOptional } from 'class-validator';
import { TYPE_LIKES } from '../constants/TYPE-LIKES.constant';
import { IsPostExist } from 'src/validations/postExists.validation';
import { IsCommentExist } from 'src/validations/commentExists.validation';

export class UpdateLikeDto {
  @IsEnum([
    TYPE_LIKES.SMILE,
    TYPE_LIKES.LIKE,
    TYPE_LIKES.DISLIKE,
    TYPE_LIKES.HEART,
  ] as TYPE_LIKES[])
  value: string;
  current_uid: string;

  @IsPostExist()
  @IsOptional()
  postId?: number;

  @IsOptional()
  @IsCommentExist()
  commentId?: number;

  @IsOptional()
  messageId?: number
}
