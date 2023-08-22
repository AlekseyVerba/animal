import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Pool } from 'pg';
import { ServeStaticModule } from '@nestjs/serve-static';

import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

//CONSTANTS
import { PATH_FILE_STATIC } from './constants/path-file-static.constant'

//MIDDLEWARES
import { GetUser } from './middlewares/getUser.middleware';

// MODULES
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { TokenModule } from './modules/token/token.module';
import { TagModule } from './modules/tag/tag.module';
import { FileModule } from './modules/file/file.module';
import { PetModule } from './modules/pet/pet.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { LikeModule } from './modules/like/like.module';
import { ChatModule } from './modules/chat/chat.module'

//CONSTANTS
import { DATABASE_POOL } from './constants/database.constants';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: PATH_FILE_STATIC,
    }),
    UserModule,
    AuthModule,
    MessageModule,
    TokenModule,
    TagModule,
    FileModule,
    PetModule,
    ProfileModule,
    PostModule,
    CommentModule,
    LikeModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: DATABASE_POOL,
      useValue: new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: Number(process.env.POSTGRES_PORT),
      }),
    },
  ],
  exports: [
    {
      provide: DATABASE_POOL,
      useValue: new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: Number(process.env.POSTGRES_PORT),
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUser).forRoutes('*');
  }
}
