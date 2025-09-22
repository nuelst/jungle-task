import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, connect } from 'amqplib';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: Channel;

  constructor(private readonly notificationsService: NotificationsService) { }

  async onModuleInit() {
    try {
      this.connection = await connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange('task.events', 'topic', { durable: true });

      await this.channel.assertQueue('notifications.task.created', { durable: true });
      await this.channel.assertQueue('notifications.task.updated', { durable: true });
      await this.channel.assertQueue('notifications.task.comment.created', { durable: true });

      await this.channel.bindQueue('notifications.task.created', 'task.events', 'task.created');
      await this.channel.bindQueue('notifications.task.updated', 'task.events', 'task.updated');
      await this.channel.bindQueue('notifications.task.comment.created', 'task.events', 'task.comment.created');

      await this.consumeMessages();

      console.log('RabbitMQ connected and consuming messages');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  //TODO: REFACTOR THIS LATER
  private async consumeMessages() {
    await this.channel.consume('notifications.task.created', async (msg) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('Received task created event:', message.data.id);
          await this.notificationsService.handleTaskCreated(message.data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing task created event:', error);
          this.channel.nack(msg, false, false);
        }
      }
    });

    await this.channel.consume('notifications.task.updated', async (msg) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('Received task updated event:', message.data.id);
          await this.notificationsService.handleTaskUpdated(message.data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing task updated event:', error);
          this.channel.nack(msg, false, false);
        }
      }
    });

    await this.channel.consume('notifications.task.comment.created', async (msg) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('Received comment created event:', message.data.comment.id);
          await this.notificationsService.handleCommentCreated(message.data.taskId, message.data.comment);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing comment created event:', error);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }
}

