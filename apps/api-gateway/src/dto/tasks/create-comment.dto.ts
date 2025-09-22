import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'This task is progressing well. Need to add error handling.',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1, { message: 'Content is required' })
  @MaxLength(500, { message: 'Content must not exceed 500 characters' })
  content: string;
}
