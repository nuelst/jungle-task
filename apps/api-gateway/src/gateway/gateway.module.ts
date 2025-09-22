import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InternalController } from './controllers/internal.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { TasksController } from './controllers/tasks.controller';
import { ProxyService } from './services/proxy.service';
import { NotificationsGateway } from './websocket/notifications.gateway';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: { expiresIn: configService.get('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('app.rabbitmq.url')],
            queue: configService.get('app.rabbitmq.queues.auth'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'TASKS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('app.rabbitmq.url')],
            queue: configService.get('app.rabbitmq.queues.tasks'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('app.rabbitmq.url')],
            queue: configService.get('app.rabbitmq.queues.notifications'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TasksController, NotificationsController, InternalController],
  providers: [ProxyService, NotificationsGateway],
  exports: [ProxyService, NotificationsGateway],
})
export class GatewayModule { }

