import { forwardRef, Module } from "@nestjs/common";

//MODULES
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import { AppModule } from "src/app.module";

//SERVICES
import { AuthService } from './auth.service';

//CONTROLLERS
import { AuthController } from './auth.controller';

//VALIDATIONS
import { IsUserNotExistByEmailConstraint } from 'src/validations/userNotExistByEmail.validation';
import { IsUserExistConstraint } from 'src/validations/userExists.validation';
import { IsUserExistByEmailConstraint } from 'src/validations/userExistByEmail.validation';
import { IsTokenExistsAndActiveConstraint } from 'src/validations/tokenExistsAndActive.validation';


@Module({
    imports: [ 
        UserModule, 
        MessageModule, 
        TokenModule,
        forwardRef(() => AppModule),
    ],

    controllers: [AuthController],
    providers: [ 
        AuthService, 
        IsUserNotExistByEmailConstraint, 
        IsUserExistConstraint, 
        IsUserExistByEmailConstraint,
        IsTokenExistsAndActiveConstraint
    ]
})
export class AuthModule { }