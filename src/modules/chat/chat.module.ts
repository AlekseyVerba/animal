import { Module, forwardRef } from "@nestjs/common";

//SERVICES
import { ChatService } from './chat.service'

//CONTROLLERS
import { ChatController } from './chat.controller'

//VALIDATIONS
import { IsMessageExistConstraint } from '../../validations/messageExists.validation'

//MODULES
import { FileModule } from '../file/file.module'
import { AppModule } from "src/app.module";
import { UserModule } from '../user/user.module'

@Module({
    imports: [forwardRef(() => AppModule),FileModule, UserModule],
    controllers: [ChatController],
    providers: [ChatService, IsMessageExistConstraint]
})
export class ChatModule {}