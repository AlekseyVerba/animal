import { Module, forwardRef } from '@nestjs/common';

//SERVICES
import { PostService } from './post.service';

//CONTROLLERS
import { PostController } from './post.controller';

//MODULES
import { AppModule } from 'src/app.module';
import { FileModule } from '../file/file.module';

//VALIDATORS
import { IsPostExistConstraint } from '../../validations/postExists.validation';

@Module({
  imports: [FileModule, forwardRef(() => AppModule)],
  controllers: [PostController],
  providers: [PostService, IsPostExistConstraint],
  exports: [IsPostExistConstraint],
})
export class PostModule {}
