import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Pool } from 'pg';
import { ServeStaticModule } from '@nestjs/serve-static';

import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

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

import { DATABASE_POOL } from './constants/database.constants';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
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
