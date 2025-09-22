import { TaskPriority } from '@jungle-gaming/types';
import { IsArray, IsDateString, IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate: string;

  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority: TaskPriority;

  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assigned user ID must be a valid UUID' })
  assignedUserIds: string[];
}

