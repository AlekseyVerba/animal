import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { SequelizeModule } from '@nestjs/sequelize';

//MIDDLEWARES
import { GetUser } from './middlewares/getUser.middleware';

// MODULES
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { TokenModule } from './modules/token/token.model';

// MODELS
import { UserToken } from './models/user-token.model';
import { User } from './models/user.model';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env')
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User,
        UserToken
      ],
      autoLoadModels: true,
      synchronize: true,
      sync: {
        alter: true
        // force: true
      }
    }),
    UserModule,
    AuthModule,
    MessageModule,
    TokenModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor() {
    console.log(process.env)
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUser).forRoutes("*")
  }
}
