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
import { TYPE_LIKES } from './constants/TYPE-LIKES.constant';

//SERVICES
import { LikeService } from './like.service';

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//SWAGGER
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddLikeApiBody } from './configs/add-like.config';
import { DeleteLikeApiBody } from './configs/delete-like.config';

//DECORATORS
import { UserProperty } from 'src/decorators/userProperty.decorator';

//DTO
import { AddLikeDto } from './dto/add-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { PostIdParam } from '../post/dto/postId.param.dto';
import { GetLikesQuery } from './dto/get-likes.query';
import { CommentIdParam } from '../comment/dto/commentId.param';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add like' })
  @ApiBody(AddLikeApiBody)
  @Post('add')
  async addLike(
    @UserProperty('uid') current_uid: string,
    @Body() dto: AddLikeDto,
  ) {
    dto.current_uid = current_uid;
    return {
      status: true,
      data: await this.likeService.addLike(dto),
      message: 'Лайк добавлен',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete like' })
  @ApiBody(DeleteLikeApiBody)
  @Delete('/delete')
  async deleteLike(
    @UserProperty('uid') current_uid: string,
    @Body() dto: DeleteLikeDto,
  ) {
    dto.current_uid = current_uid;
    await this.likeService.deleteLike(dto);
    return {
      status: true,
      message: 'Лайк удалён',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update like' })
  @ApiBody(AddLikeApiBody)
  @Put('update')
  async updateLike(
    @UserProperty('uid') current_uid: string,
    @Body() dto: UpdateLikeDto,
  ) {
    dto.current_uid = current_uid;

    return {
      status: true,
      data: await this.likeService.updateLike(dto),
      message: 'Лайк обновлён',
    };
  }

  @ApiOperation({ summary: 'Get like from post' })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    enum: [
      TYPE_LIKES.DISLIKE,
      TYPE_LIKES.HEART,
      TYPE_LIKES.LIKE,
      TYPE_LIKES.SMILE,
    ] as TYPE_LIKES[],
  })
  @Get('post/:postId')
  async getPostLikes(
    @Param() { postId }: PostIdParam,
    @Query() { limit, offset, sort }: GetLikesQuery,
  ) {
    return {
      status: true,
      data: await this.likeService.getLikes({
        postId,
        limit,
        offset,
        sort,
      }),
    };
  }

  @ApiOperation({ summary: 'Get like from comment' })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    enum: [
      TYPE_LIKES.DISLIKE,
      TYPE_LIKES.HEART,
      TYPE_LIKES.LIKE,
      TYPE_LIKES.SMILE,
    ] as TYPE_LIKES[],
  })
  @Get('comment/:commentId')
  async getCommentLikes(
    @Param() { commentId }: CommentIdParam,
    @Query() { limit, offset, sort }: GetLikesQuery,
  ) {
    return {
      status: true,
      data: await this.likeService.getLikes({
        commentId,
        limit,
        offset,
        sort,
      }),
    };
  }
}
