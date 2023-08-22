import { Module, forwardRef } from '@nestjs/common';

//SERVICES
import { ChatService } from './chat.service';

//GATEWAYS
import { ChatGateway } from './chat.gateway';

//CONTROLLERS
import { ChatController } from './chat.controller';

//VALIDATIONS
import { IsMessageExistConstraint } from '../../validations/messageExists.validation';

//MODULES
import { FileModule } from '../file/file.module';
import { AppModule } from 'src/app.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AppModule), FileModule, UserModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, IsMessageExistConstraint, ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
