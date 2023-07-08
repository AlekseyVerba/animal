import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsCommentExist } from 'src/validations/commentExists.validation';
import { IsPostExist } from 'src/validations/postExists.validation';
import { TYPE_LIKES } from '../constants/TYPE-LIKES.constant';

export class AddLikeDto {
  @IsString()
  @IsEnum([
    TYPE_LIKES.SMILE,
    TYPE_LIKES.LIKE,
    TYPE_LIKES.DISLIKE,
    TYPE_LIKES.HEART,
  ] as TYPE_LIKES[])
  value: string;

  @IsOptional()
  @IsCommentExist()
  commentId?: number;

  @IsOptional()
  @IsPostExist()
  postId?: number;

  @IsOptional()
  messageId?: number

  current_uid: string;
}
