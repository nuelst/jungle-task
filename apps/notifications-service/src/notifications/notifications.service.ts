import { Notification, NotificationStatus, NotificationType, User } from '@jungle-gaming/entities';
import { PaginatedResponse } from '@jungle-gaming/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    data: any,
    userIds: string[],
  ): Promise<Notification[]> {
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    const notifications = users.map(user =>
      this.notificationRepository.create({
        type,
        title,
        message,
        data,
        user,
        status: NotificationStatus.UNREAD,
      }),
    );

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Send WebSocket notification to API Gateway
    await this.sendWebSocketNotification(userIds, type, savedNotifications);

    return savedNotifications;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<PaginatedResponse<Notification>> {
    const validPage = Math.max(1, Number(page) || 1);
    const validSize = Math.min(100, Math.max(1, Number(size) || 10));
    const offset = (validPage - 1) * validSize;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: validSize,
    });

    const totalPages = Math.max(1, Math.ceil(total / validSize));
    return { data: notifications, total, page: validPage, size: validSize, totalPages };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, status: NotificationStatus.UNREAD },
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  // Handle task events from RabbitMQ
  async handleTaskCreated(task: any): Promise<void> {
    const assignedUserIds = task.assignedUsers?.map((user: any) => user.id) || [];

    if (assignedUserIds.length > 0) {
      await this.createNotification(
        NotificationType.TASK_CREATED,
        'Nova Tarefa Atribuída',
        `Você foi atribuído à tarefa: ${task.title}`,
        { taskId: task.id, taskTitle: task.title, taskPriority: task.priority },
        assignedUserIds,
      );
    }
  }

  async handleTaskUpdated(task: any): Promise<void> {
    const assignedUserIds = task.assignedUsers?.map((user: any) => user.id) || [];
    const creatorId = task.createdBy?.id;

    // Notify assigned users and creator
    const userIds = [...assignedUserIds];
    if (creatorId && !assignedUserIds.includes(creatorId)) {
      userIds.push(creatorId);
    }

    if (userIds.length > 0) {
      await this.createNotification(
        NotificationType.TASK_UPDATED,
        'Tarefa Atualizada',
        `A tarefa "${task.title}" foi atualizada`,
        { taskId: task.id, taskTitle: task.title, taskStatus: task.status },
        userIds,
      );
    }
  }

  async handleCommentCreated(taskId: string, comment: any): Promise<void> {
    const task = comment.task;
    if (!task) return;

    const assignedUserIds = task.assignedUsers?.map((user: any) => user.id) || [];
    const creatorId = task.createdBy?.id;
    const commentAuthorId = comment.author?.id;

    const userIds = [...assignedUserIds];
    if (creatorId && !assignedUserIds.includes(creatorId)) {
      userIds.push(creatorId);
    }

    const filteredUserIds = userIds.filter(id => id !== commentAuthorId);

    if (filteredUserIds.length > 0) {
      await this.createNotification(
        NotificationType.COMMENT_CREATED,
        'Novo Comentário',
        `Novo comentário na tarefa "${task.title}"`,
        {
          taskId: task.id,
          taskTitle: task.title,
          commentId: comment.id,
          commentAuthor: comment.author?.username,
        },
        filteredUserIds,
      );
    }
  }

  private async getTaskById(taskId: string): Promise<any> {

    return {
      id: taskId,
      title: 'Task Title',
      assignedUsers: [],
    };
  }

  private async sendWebSocketNotification(userIds: string[], type: NotificationType, notifications: Notification[]): Promise<void> {
    try {
      console.log('Sending WebSocket notification:', { userIds, type, notificationCount: notifications.length });

      const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3001';

      for (const userId of userIds) {
        const userNotifications = notifications.filter(n => n.user.id === userId);

        if (userNotifications.length > 0) {
          console.log(`Sending WebSocket notification to user ${userId}:`, userNotifications.length, 'notifications');

          const response = await fetch(`${apiGatewayUrl}/websocket/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              type,
              notifications: userNotifications,
            }),
          });

          if (response.ok) {
            console.log(`WebSocket notification sent successfully to user ${userId}`);
          } else {
            console.error(`Failed to send WebSocket notification to user ${userId}:`, response.status, response.statusText);
          }
        }
      }
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
    }
  }
}

