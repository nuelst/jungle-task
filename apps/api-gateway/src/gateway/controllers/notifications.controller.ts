import { JwtPayload } from '@jungle-gaming/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  NotificationListResponseDto,
  NotificationQueryDto,
  UnreadCountResponseDto,
} from '../../dto';
import { ProxyService } from '../services/proxy.service';

@ApiTags('Notifications')
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly proxyService: ProxyService) { }

  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Get a paginated list of notifications for the authenticated user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: NotificationListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getUserNotifications(
    @Query() query: NotificationQueryDto,
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<NotificationListResponseDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.getNotifications(query, token);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description: 'Get the count of unread notifications for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    type: UnreadCountResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<UnreadCountResponseDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.getUnreadCount(token);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read'
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification marked as read' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.markNotificationAsRead(id, token);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all notifications for the authenticated user as read'
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'All notifications marked as read' },
        count: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async markAllAsRead(
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<{ message: string; count: number }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.markAllNotificationsAsRead(token);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification deleted successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.deleteNotification(id, token);
  }

  @Post('websocket')
  @ApiOperation({
    summary: 'Send WebSocket notification',
    description: 'Internal endpoint to trigger WebSocket notifications'
  })
  async sendWebSocketNotification(@Body() data: any): Promise<{ message: string }> {
    console.log('WebSocket notification received:', data);
    return this.proxyService.sendWebSocketNotification(data);
  }

  @Get('test')
  @UseGuards()
  test() {
    return { message: 'Test endpoint working' };
  }
}

