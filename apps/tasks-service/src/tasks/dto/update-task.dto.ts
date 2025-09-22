import { TaskStatus } from '@jungle-gaming/types';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, REVIEW, or DONE' })
  status?: TaskStatus;
}

