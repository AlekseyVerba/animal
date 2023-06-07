import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

//SERVICES
import { PostFavoriteService } from './post-favorite.service';

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//DECORATORS
import { UserProperty } from '../../decorators/userProperty.decorator';

//DTO
import { PostIdParam } from './dto/postId.param.dto';
import { GetMyFavoriteProjectsDTO } from './dto/get-my-favorite-projects.dto';

//SWAGGER
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Избранные посты')
@Controller('post/favorites')
export class PostFavoriteController {
  constructor(private readonly postFavoriteService: PostFavoriteService) {}

  @ApiOperation({ summary: 'Добавить пост в избранное' })
  @UseGuards(AuthGuard)
  @Post(':postId/favorite/add')
  async addPostToFavorite(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    return {
      status: true,
      data: await this.postFavoriteService.addPostToFavorite({
        postId,
        current_uid,
      }),
    };
  }

  @ApiOperation({ summary: 'Удалить пост из избранного' })
  @UseGuards(AuthGuard)
  @Delete(':postId/favorite/delete')
  async deletePostFromFavorite(
    @Param() { postId }: PostIdParam,
    @UserProperty('uid') current_uid: string,
  ) {
    return {
      status: true,
      data: await this.postFavoriteService.deletePostFromFavorite({
        postId,
        current_uid,
      }),
    };
  }

  @ApiOperation({ summary: 'Получить избранные посты' })
  @UseGuards(AuthGuard)
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
  @Get('my')
  async getMyFavoriteProjects(
    @Query() queryDTO: GetMyFavoriteProjectsDTO,
    @UserProperty('uid') current_uid: string,
  ) {
    queryDTO.current_uid = current_uid;

    return {
      status: true,
      data: await this.postFavoriteService.getMyFavoriteProjects(queryDTO),
    };
  }
}
