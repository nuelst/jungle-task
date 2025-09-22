import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject('EVENTS_SERVICE') private readonly eventsClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    console.log('Comment controller - req.user:', req.user);
    const userId = req.user.id;
    console.log('Comment controller - userId:', userId);
    const comment = await this.commentsService.create(taskId, createCommentDto, userId);

    this.eventsClient.emit('task.comment.created', { taskId, comment });

    return comment;
  }

  @Get()
  async findByTaskId(
    @Param('taskId') taskId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.findByTaskId(taskId, query);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || 'unk'
    return this.commentsService.remove(id, userId);
  }

  @MessagePattern('comments.findByTaskId')
  async findByTaskIdMicroservice(data: { taskId: string; query: CommentQueryDto }) {
    return this.commentsService.findByTaskId(data.taskId, data.query);
  }

  @MessagePattern('comments.create')
  async createMicroservice(data: { taskId: string; createCommentDto: CreateCommentDto; userId: string }) {
    const comment = await this.commentsService.create(data.taskId, data.createCommentDto, data.userId);


    this.eventsClient.emit('task.comment.created', { taskId: data.taskId, comment });

    return comment;
  }

  @MessagePattern('comments.remove')
  async removeMicroservice(data: { id: string; userId: string }) {
    return this.commentsService.remove(data.id, data.userId);
  }
}

