import { TaskPriority, TaskStatus } from '@jungle-gaming/types';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Size must be an integer' })
  @Min(1, { message: 'Size must be at least 1' })
  @Max(100, { message: 'Size must not exceed 100' })
  size?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, REVIEW, or DONE' })
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

