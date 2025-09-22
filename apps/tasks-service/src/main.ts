import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
  console.log(`Tasks service is running on port ${port}`);
  console.log('Tasks microservice is listening for RabbitMQ messages');
}

bootstrap();

