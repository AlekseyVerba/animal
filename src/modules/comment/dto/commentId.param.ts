import { IsCommentExist } from '../../../validations/commentExists.validation';

export class CommentIdParam {
  @IsCommentExist()
  commentId: number;
}
