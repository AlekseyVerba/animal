import { forwardRef, Module } from '@nestjs/common'
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { AppModule } from 'src/app.module';

@Module({
    imports: [
        forwardRef(() => AppModule)
    ],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService]
})
export class TokenModule {}