import { TaskPriority, TaskStatus } from '@jungle-gaming/types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TaskQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Size must be an integer' })
  @Min(1, { message: 'Size must be at least 1' })
  @Max(100, { message: 'Size must not exceed 100' })
  size?: number = 10;

  @ApiProperty({
    description: 'Search term for filtering tasks by title or description',
    example: 'authentication',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by task priority',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Filter by task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, REVIEW, or DONE' })
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    example: '2bd61026-9b01-4b4e-b9bf-2837d2cf58b0',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
