import { TaskPriority, TaskStatus } from '@jungle-gaming/types';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: '2bd61026-9b01-4b4e-b9bf-2837d2cf58b0',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;
}

export class CommentDto {
  @ApiProperty({
    description: 'Comment ID',
    example: '3ce72137-ac12-5c5f-c0cf-3948e3e3f69c',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This task is progressing well.',
  })
  content: string;

  @ApiProperty({
    description: 'Comment author',
    type: UserDto,
  })
  author: UserDto;

  @ApiProperty({
    description: 'Comment creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Comment last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class TaskDto {
  @ApiProperty({
    description: 'Task ID',
    example: '1ae23456-7b89-4c5d-e6f7-890123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
  })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement JWT-based authentication system',
  })
  description: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task due date',
    example: '2024-02-15T23:59:59.000Z',
  })
  dueDate: string;

  @ApiProperty({
    description: 'Task creator',
    type: UserDto,
  })
  creator: UserDto;

  @ApiProperty({
    description: 'Users assigned to this task',
    type: [UserDto],
    isArray: true,
  })
  assignedUsers: UserDto[];

  @ApiProperty({
    description: 'Task comments',
    type: [CommentDto],
    isArray: true,
  })
  comments: CommentDto[];

  @ApiProperty({
    description: 'Task creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Task last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 25,
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
    example: 3,
  })
  totalPages: number;
}

export class TaskListResponseDto extends PaginatedResponseDto<TaskDto> {
  @ApiProperty({
    description: 'Array of tasks',
    type: [TaskDto],
    isArray: true,
  })
  data: TaskDto[];
}

export class CommentListResponseDto extends PaginatedResponseDto<CommentDto> {
  @ApiProperty({
    description: 'Array of comments',
    type: [CommentDto],
    isArray: true,
  })
  data: CommentDto[];
}
