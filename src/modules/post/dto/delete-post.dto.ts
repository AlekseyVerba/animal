import { IsPostExist } from 'src/validations/postExists.validation';

export class DeletePostDto {
  current_uid: string;

  @IsPostExist()
  postId: number;
}
