import { Module, forwardRef } from '@nestjs/common';

//MODULES
import { AppModule } from 'src/app.module';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';

//CONTROLLERS
import { CommentController } from './comment.controller';

//SERVICES
import { CommentService } from './comment.service';

//VALIDATORS
import { IsCommentExistConstraint } from '../../validations/commentExists.validation';

@Module({
  imports: [forwardRef(() => AppModule), UserModule, PostModule],
  controllers: [CommentController],
  providers: [CommentService, IsCommentExistConstraint],
  exports: [IsCommentExistConstraint],
})
export class CommentModule {}
