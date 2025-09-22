import { Notification, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQService } from '../common/services/rabbitmq.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    JwtModule.register({}),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, RabbitMQService],
  exports: [NotificationsService],
})
export class NotificationsModule { }

