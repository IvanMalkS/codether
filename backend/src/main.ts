import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // CORS
  app.enableCors();

  // Use ts ignore for plugins width fastify version > 4.13.0.
  // More info https://github.com/nestjs/nest/issues/11265

  // @ts-expect-error FastifyHelmet type mismatch
  await app.register(helmet);
  // @ts-expect-error FastifyCsrfProtection type mismatch
  await app.register(fastifyCsrf);

  // Initialize Swagger
  const config = new DocumentBuilder()
    .setTitle('Codether API')
    .setDescription(
      'The Codether API is free to use and open source. It allows you to create, read, update, and delete code snippets.',
    )
    .setVersion('1.0')
    .addTag('code')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Initialize app
  await app.listen(3123);

  await app.startAllMicroservices();
}

bootstrap();
