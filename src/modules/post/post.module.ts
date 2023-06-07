import { Module, forwardRef } from '@nestjs/common';

//SERVICES
import { PostService } from './post.service';
import { PostFavoriteService } from './post-favorite.service';

//CONTROLLERS
import { PostController } from './post.controller';
import { PostFavoriteController } from './post-favorite.controller';

//MODULES
import { AppModule } from 'src/app.module';
import { FileModule } from '../file/file.module';

//VALIDATORS
import { IsPostExistConstraint } from '../../validations/postExists.validation';

@Module({
  imports: [FileModule, forwardRef(() => AppModule)],
  controllers: [PostController, PostFavoriteController],
  providers: [PostService, IsPostExistConstraint, PostFavoriteService],
  exports: [PostService, IsPostExistConstraint],
})
export class PostModule {}
