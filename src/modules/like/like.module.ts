import { Module, forwardRef } from '@nestjs/common';

//MODULES
import { AppModule } from 'src/app.module';
import { ChatModule } from '../chat/chat.module'

//CONTROLLERS
import { LikeController } from './like.controller';

//SERVICES
import { LikeService } from './like.service';

//VALIDATORS
import { IsLikeExistConstraint } from '../../validations/likeExists.validation';

@Module({
  imports: [forwardRef(() => AppModule), ChatModule],
  controllers: [LikeController],
  providers: [LikeService, IsLikeExistConstraint],
  exports: [IsLikeExistConstraint],
})
export class LikeModule {}
