import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Content is required' })
  @MaxLength(500, { message: 'Content must not exceed 500 characters' })
  content: string;
}

