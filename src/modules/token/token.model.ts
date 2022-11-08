import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { UserToken } from '../../models/user-token.model';
import { User } from 'src/models/user.model';

@Module({
    imports: [
        SequelizeModule.forFeature([UserToken, User])
    ],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService]
})
export class TokenModule {}