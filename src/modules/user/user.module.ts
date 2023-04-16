import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppModule } from 'src/app.module';
import { IsUserExistConstraint } from 'src/validations/userExists.validation';
import { FileModule } from 'src/modules/file/file.module';

@Module({
  imports: [forwardRef(() => AppModule), FileModule],
  controllers: [UserController],
  providers: [UserService, IsUserExistConstraint],
  exports: [UserService],
})
export class UserModule {}
