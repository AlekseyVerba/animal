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
import { UpdateCommentApiBody } from './configs/update-comment.config';

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

    return {
      status: true,
      data: await this.commentService.addCommentToProject(dto),
      message: 'Комментарий добавлен',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update comment' })
  @ApiBody(UpdateCommentApiBody)
  @Put(':commentId/update')
  async updateComment(
    @Param() { commentId }: CommentIdParam,
    @UserProperty('uid') current_uid: string,
    @Body() dto: UpdateCommentDto,
  ) {
    dto.commentId = commentId;
    dto.current_uid = current_uid;

    return {
      status: true,
      data: await this.commentService.updateComment(dto),
      message: 'Комментарий обновлен',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete comment' })
  @Delete(':commentId/delete')
  async deleteComment(
    @Param() { commentId }: CommentIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    await this.commentService.deleteComment({ commentId, current_uid });

    return {
      status: true,
      message: 'Комментарий удалён',
    };
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
    summary: 'Получение подкомментариев.',
    description: 'Получение комментариев идет с последних записей',
  })
  @Get(':commentId/subcomments')
  async getSubComments(
    @Param() { commentId }: CommentIdParam,
    @Query() { limit, offset }: GetCommentsQuery,
    @UserProperty('uid') current_uid?: string,
  ) {
    return {
      status: true,
      data: await this.commentService.getSubComments({
        commentId,
        current_uid,
        limit,
        offset,
      }),
    };
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
    return {
      status: true,
      data: await this.commentService.getComments({
        postId,
        current_uid,
        limit,
        offset,
      }),
    };
  }
}
