import { IsLikeExist } from '../../../validations/likeExists.validation';

export class IsAddedByIdDto {
  current_uid: string;

  @IsLikeExist()
  likeId: number;
}
