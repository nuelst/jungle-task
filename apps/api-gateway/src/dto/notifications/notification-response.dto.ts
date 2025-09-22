import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '4df34567-8c90-5d6e-f7g8-901234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New task assigned',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have been assigned to the task "Implement user authentication"',
  })
  message: string;

  @ApiProperty({
    description: 'Notification type',
    example: 'task_assigned',
  })
  type: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Additional data related to the notification',
    example: { taskId: '1ae23456-7b89-4c5d-e6f7-890123456789' },
  })
  data: any;

  @ApiProperty({
    description: 'Notification creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Notification last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: 'Array of notifications',
    type: [NotificationDto],
    isArray: true,
  })
  data: NotificationDto[];

  @ApiProperty({
    description: 'Total number of notifications',
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  size: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'Number of unread notifications',
    example: 5,
  })
  count: number;
}
