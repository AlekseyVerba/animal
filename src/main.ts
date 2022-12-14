import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Iogru')
    .setDescription('IogruAPI')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'firebase',
        description: 'Enter JWT token',
        in: 'header'
      },
      'firebase-auth'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);
  

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
