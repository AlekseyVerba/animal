import { Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SequelizeModule } from "@nestjs/sequelize";

//MODULES
import { TokenModule } from '../token/token.model';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';

//MODELS
import { UserToken } from '../../models/user-token.model';
import { User } from '../../models/user.model';

@Module({
    imports: [ 
        UserModule, 
        MessageModule, 
        TokenModule,
        SequelizeModule.forFeature([ UserToken, User ])],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }