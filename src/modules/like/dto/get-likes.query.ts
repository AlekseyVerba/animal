import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TYPE_LIKES } from '../constants/TYPE-LIKES.constant';

export class GetLikesQuery {
  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsEnum([
    TYPE_LIKES.SMILE,
    TYPE_LIKES.LIKE,
    TYPE_LIKES.DISLIKE,
    TYPE_LIKES.HEART,
  ] as TYPE_LIKES[])
  sort?: TYPE_LIKES;
}
