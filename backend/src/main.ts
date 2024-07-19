import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
  );

  const config = new DocumentBuilder()
      .setTitle('Codether API')
      .setDescription('The Codether API is free to use and open source. It allows you to create, read, update, and delete code snippets.')
      .setVersion('1.0')
      .addTag('code')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3123);
}
bootstrap();
