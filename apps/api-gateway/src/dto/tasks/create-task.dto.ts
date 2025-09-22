import { TaskPriority } from '@jungle-gaming/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Implement JWT-based authentication system with login and registration',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @ApiProperty({
    description: 'Task due date',
    example: '2024-02-15T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate: string;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Array of user IDs assigned to this task',
    example: ['2bd61026-9b01-4b4e-b9bf-2837d2cf58b0', '3ce72137-ac12-5c5f-c0cf-3948e3e3f69c'],
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assigned user ID must be a valid UUID' })
  assignedUserIds: string[];
}
