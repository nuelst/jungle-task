import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import axios, { AxiosInstance } from 'axios';
import { firstValueFrom, timeout } from 'rxjs';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class ProxyService {
  private readonly authServiceHttp: AxiosInstance;
  private readonly tasksServiceHttp: AxiosInstance;
  private readonly notificationsServiceHttp: AxiosInstance;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('TASKS_SERVICE') private readonly tasksService: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    this.authServiceHttp = axios.create({
      baseURL: this.configService.get('app.services.auth.url'),
      timeout: this.configService.get('app.services.auth.timeout'),
    });

    this.tasksServiceHttp = axios.create({
      baseURL: this.configService.get('app.services.tasks.url'),
      timeout: this.configService.get('app.services.tasks.timeout'),
    });

    this.notificationsServiceHttp = axios.create({
      baseURL: this.configService.get('app.services.notifications.url'),
      timeout: this.configService.get('app.services.notifications.timeout'),
    });
  }

  async authRegister(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.authService.send('auth.register', { createUserDto: data }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Auth Service');
    }
  }

  async authLogin(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.authService.send('auth.login', { loginDto: data }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Auth Service');
    }
  }

  async authRefresh(data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.authService.send('auth.refresh', { refreshTokenDto: data }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Auth Service');
    }
  }

  async authProfile(token: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.authService.send('auth.profile', { token }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Auth Service');
    }
  }

  async authGetUsers(): Promise<any> {
    try {
      return await firstValueFrom(
        this.authService.send('auth.users', {}).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Auth Service');
    }
  }

  async authGetUsersWithStats(): Promise<any[]> {
    try {
      const response = await this.authServiceHttp.get('/auth/users/stats');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Auth Service');
    }
  }

  async authGetSystemOverview(): Promise<any> {
    try {
      const response = await this.authServiceHttp.get('/auth/overview');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Auth Service');
    }
  }

  async authDebugUsers(): Promise<any> {
    try {
      const response = await this.authServiceHttp.get('/auth/debug/users');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Auth Service');
    }
  }

  async getTasks(query: any, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.get('/tasks', {
        params: query,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async getMyTasks(query: any, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.get('/tasks/my-tasks', {
        params: query,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async getTask(id: string, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.get(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async createTask(data: any, token: string): Promise<any> {
    try {
      // console.log('ProxyService - Creating task with data:', data);
      // console.log('ProxyService - Token present:', !!token);
      // console.log('ProxyService - Token value:', token);
      // console.log('ProxyService - Tasks Service URL:', this.configService.get('app.services.tasks.url'));

      const response = await this.tasksServiceHttp.post('/tasks', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log('ProxyService - Task created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // console.log('ProxyService - Error creating task:', error.response?.data || error.message);
      // console.log('ProxyService - Error status:', error.response?.status);
      // console.log('ProxyService - Error headers:', error.response?.headers);
      this.handleError(error, 'Tasks Service');
    }
  }

  async updateTask(id: string, data: any, userId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.tasksService.send('tasks.update', { id, updateTaskDto: data, userId }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Tasks Service');
    }
  }

  async deleteTask(id: string, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async getTaskComments(taskId: string, query: any, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.get(`/tasks/${taskId}/comments`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async createTaskComment(taskId: string, data: any, token: string): Promise<any> {
    try {
      // console.log('Creating task comment - taskId:', taskId, 'token:', token ? 'Present' : 'Missing');
      const response = await this.tasksServiceHttp.post(`/tasks/${taskId}/comments`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating task comment:', error.response?.data);
      this.handleError(error, 'Tasks Service');
    }
  }

  async deleteComment(commentId: string, token: string): Promise<any> {
    try {
      const response = await this.tasksServiceHttp.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Tasks Service');
    }
  }

  async getNotifications(query: any, token: string): Promise<any> {
    try {
      const userId = this.extractUserIdFromToken(token);
      return await firstValueFrom(
        this.notificationsService.send('notifications.getUserNotifications', {
          userId,
          page: query.page,
          size: query.size
        }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Notifications Service');
    }
  }

  async getUnreadCount(token: string): Promise<any> {
    try {
      const userId = this.extractUserIdFromToken(token);
      return await firstValueFrom(
        this.notificationsService.send('notifications.getUnreadCount', { userId }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Notifications Service');
    }
  }

  async markNotificationAsRead(id: string, token: string): Promise<any> {
    try {
      const userId = this.extractUserIdFromToken(token);
      return await firstValueFrom(
        this.notificationsService.send('notifications.markAsRead', { id, userId }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Notifications Service');
    }
  }

  async markAllNotificationsAsRead(token: string): Promise<any> {
    try {
      const userId = this.extractUserIdFromToken(token);
      return await firstValueFrom(
        this.notificationsService.send('notifications.markAllAsRead', { userId }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Notifications Service');
    }
  }

  async deleteNotification(id: string, token: string): Promise<any> {
    try {
      const userId = this.extractUserIdFromToken(token);
      return await firstValueFrom(
        this.notificationsService.send('notifications.deleteNotification', { id, userId }).pipe(timeout(10000))
      );
    } catch (error) {
      this.handleMicroserviceError(error, 'Notifications Service');
    }
  }

  private extractUserIdFromToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('app.jwt.secret')
      });
      return payload.sub || payload.id;
    } catch (error) {
      console.warn('Failed to extract user ID from token:', error);
      throw new Error('Invalid token');
    }
  }

  private handleMicroserviceError(error: any, service: string): never {
    console.error(`${service} error:`, error);

    if (error?.message) {
      throw new HttpException(
        {
          message: error.message,
          error: `${service} Error`,
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      {
        message: `${service} is unavailable`,
        error: 'Service Unavailable',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  private handleError(error: any, service: string): never {
    if (error.response) {
      const { status, data } = error.response;
      throw new HttpException(
        {
          message: data.message || `Error from ${service}`,
          error: data.error || 'Service Error',
          statusCode: status,
        },
        status,
      );
    } else if (error.request) {
      throw new HttpException(
        {
          message: `${service} is unavailable`,
          error: 'Service Unavailable',
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      throw new HttpException(
        {
          message: 'Internal server error',
          error: 'Internal Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendNotificationToUser(userId: string, event: string, data: any): Promise<void> {
    this.notificationsGateway.sendToUser(userId, event, data);
  }

  async sendNotificationToUsers(userIds: string[], event: string, data: any): Promise<void> {
    this.notificationsGateway.sendToUsers(userIds, event, data);
  }

  async broadcastNotification(event: string, data: any): Promise<void> {
    this.notificationsGateway.broadcast(event, data);
  }

  async sendNotificationToRoom(room: string, event: string, data: any): Promise<void> {
    this.notificationsGateway.sendToRoom(room, event, data);
  }

  async sendWebSocketNotification(data: any): Promise<{ message: string }> {
    const { userId, type, notifications } = data;

    let event = 'notification';
    switch (type) {
      case 'TASK_CREATED':
        event = 'task:created';
        break;
      case 'TASK_UPDATED':
        event = 'task:updated';
        break;
      case 'COMMENT_CREATED':
        event = 'comment:created';
        break;
      default:
        event = 'notification';
    }


    this.notificationsGateway.sendToUser(userId, event, {
      type,
      notifications,
      timestamp: new Date().toISOString(),
    });

    return { message: 'WebSocket notification sent' };
  }
}

