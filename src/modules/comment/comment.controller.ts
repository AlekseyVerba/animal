import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

//SERVICES
import { CommentService } from './comment.service';

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//SWAGGER
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddCommentApiBody } from './configs/add-comment.config';

//DTO
import { AddCommentDto } from './dto/add-comment.dto';
import { CommentIdParam } from './dto/commentId.param';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostIdParam } from '../post/dto/postId.param.dto';
import { GetCommentsQuery } from './dto/get-comments.query';

//DECORATORS
import { UserProperty } from 'src/decorators/userProperty.decorator';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add comment' })
  @ApiBody(AddCommentApiBody)
  @Post('add/:postId')
  async addCommentToProject(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
    @Body() dto: AddCommentDto,
  ) {
    dto.postId = postId;
    dto.current_uid = current_uid;

    return await this.commentService.addCommentToProject(dto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update comment' })
  @ApiBody(AddCommentApiBody)
  @Put(':commentId/update')
  async updateComment(
    @Param() { commentId }: CommentIdParam,
    @UserProperty('uid') current_uid: string,
    @Body() dto: UpdateCommentDto,
  ) {
    dto.commentId = commentId;
    dto.current_uid = current_uid;

    return await this.commentService.updateComment(dto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete comment' })
  @Delete(':commentId/delete')
  async deleteComment(
    @Param() { commentId }: CommentIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    return await this.commentService.deleteComment({ commentId, current_uid });
  }

  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @ApiOperation({
    summary: 'Get comments from post',
    description: 'Получение комментариев идет с последних записей',
  })
  @Get(':postId/comments')
  async getComments(
    @Param() { postId }: PostIdParam,
    @Query() { limit, offset }: GetCommentsQuery,
    @UserProperty('uid') current_uid?: string,
  ) {
    return await this.commentService.getComments({
      postId,
      current_uid,
      limit,
      offset,
    });
  }
}
