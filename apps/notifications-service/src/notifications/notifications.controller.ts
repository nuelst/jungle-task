import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'notifications-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const userId = req.user.id;
    return this.notificationsService.getUserNotifications(userId, page, size);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'unk'; // In real app, get from JWT
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user?.id || 'unk';
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'unk';
    await this.notificationsService.deleteNotification(id, userId);
    return { message: 'Notification deleted' };
  }

  @MessagePattern('notifications.getUserNotifications')
  async getUserNotificationsMicroservice(data: { userId: string; page?: number; size?: number }) {
    return this.notificationsService.getUserNotifications(data.userId, data.page, data.size);
  }

  @MessagePattern('notifications.getUnreadCount')
  async getUnreadCountMicroservice(data: { userId: string }) {
    const count = await this.notificationsService.getUnreadCount(data.userId);
    return { count };
  }

  @MessagePattern('notifications.markAsRead')
  async markAsReadMicroservice(data: { id: string; userId: string }) {
    return this.notificationsService.markAsRead(data.id, data.userId);
  }

  @MessagePattern('notifications.markAllAsRead')
  async markAllAsReadMicroservice(data: { userId: string }) {
    await this.notificationsService.markAllAsRead(data.userId);
    return { message: 'All notifications marked as read' };
  }

  @MessagePattern('notifications.deleteNotification')
  async deleteNotificationMicroservice(data: { id: string; userId: string }) {
    await this.notificationsService.deleteNotification(data.id, data.userId);
    return { message: 'Notification deleted' };
  }

  @EventPattern('task.created')
  async handleTaskCreated(data: any) {
    console.log('Received task.created event via microservice:', data);
    await this.notificationsService.handleTaskCreated(data);
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(data: any) {
    console.log('Received task.updated event via microservice:', data);
    await this.notificationsService.handleTaskUpdated(data);
  }

  @EventPattern('task.comment.created')
  async handleCommentCreated(data: any) {
    console.log('Received task.comment.created event via microservice:', data);
    await this.notificationsService.handleCommentCreated(data.taskId, data.comment);
  }
}

