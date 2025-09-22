import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('app.cors.origin'),
    credentials: configService.get('app.cors.credentials'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and user management service for Jungle Gaming')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('app.rabbitmq.url')],
      queue: configService.get('app.rabbitmq.queue'),
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get('app.port');
  await app.listen(port);
  console.log(`Auth service is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  console.log('Auth microservice is listening for RabbitMQ messages');
}

bootstrap();
