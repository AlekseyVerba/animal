import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppModule } from 'src/app.module'
import { IsUserExistConstraint } from 'src/validations/userExists.validation';

@Module({
    imports: [
        forwardRef(() => AppModule)
    ],
    controllers: [UserController],
    providers: [UserService, IsUserExistConstraint],
    exports: [UserService]
})
export class UserModule {}