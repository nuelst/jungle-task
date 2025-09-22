import { Task, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
    ClientsModule.register([
      {
        name: 'EVENTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: 'events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService, JwtAuthGuard, JwtStrategy],
  exports: [TasksService],
})
export class TasksModule { }

