import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

//SWAGGER
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePostApiBody } from './configs/create-post.config';
import { UpdatePostApiBody } from './configs/update-post.config';
import { GetLinePostsApiBody } from './configs/get-line-posts.config'

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//SERVICES
import { PostService } from './post.service';

//DTO
import { CreatePostDto } from './dto/create-post.dto';
import { UserProperty } from 'src/decorators/userProperty.decorator';
import { PostIdParam } from './dto/postId.param.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { GetLinePostsDto } from './dto/get-line-posts.dto'

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a post' })
  @ApiBody(CreatePostApiBody)
  @Post('create')
  @UseInterceptors(AnyFilesInterceptor())
  async createPost(
    @UserProperty('uid') current_uid: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: CreatePostDto,
  ) {
    dto.current_uid = current_uid;

    return {
      status: true,
      data: await this.postService.createPost(files, dto),
      message: 'Пост создан',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update post' })
  @ApiBody(UpdatePostApiBody)
  @Put(':postId/update')
  @UseInterceptors(AnyFilesInterceptor())
  async updatePost(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: UpdatePostDto,
  ) {
    dto.id = postId;
    dto.current_uid = current_uid;

    return {
      status: true,
      data: await this.postService.updatePost(files, dto),
      message: 'Пост обновлён',
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete post' })
  @Delete(':postId/delete')
  async deletePost(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    await this.postService.deletePost({ postId, current_uid });

    return {
      status: true,
      message: 'Пост удалён',
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
  @ApiQuery({
    name: 'orderBy',
    type: 'string',
    required: false,
    enum: ['view', 'like', 'date'],
  })
  @ApiQuery({
    name: 'order',
    type: 'string',
    required: false,
    enum: ['DESC', 'ASC'],
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'pet_id',
    type: 'number',
    required: false,
  })
  @ApiOperation({ summary: 'Get posts' })
  @Get('all')
  async getPosts(
    @UserProperty('uid') current_uid: string,
    @Query() dto: GetPostsDto,
  ) {
    dto.current_uid = current_uid;

    return {
      status: true,
      data: await this.postService.getPosts(dto),
    };
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get post.Получает последние 15 комментариев' })
  async getPost(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    return {
      status: true,
      data: await this.postService.getPost({ postId, current_uid }),
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Получить ленту постов' })
  @ApiBody(GetLinePostsApiBody)
  @Post('line/all')
  async getLinePosts(
    @Body() dto: GetLinePostsDto,
    @UserProperty('uid') current_uid: string
  ) {
    dto.current_uid = current_uid

    return {
      status: true,
      data: await this.postService.getLinePosts(dto)
    }
  }
}
