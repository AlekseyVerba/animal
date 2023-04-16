import { IsPostExist } from '../../../validations/postExists.validation';

export class PostIdParam {
  @IsPostExist()
  postId: number;
}
