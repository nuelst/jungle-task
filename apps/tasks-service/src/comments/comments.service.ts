import { Comment, Task, User } from '@jungle-gaming/entities';
import { PaginatedResponse } from '@jungle-gaming/types';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(taskId: string, createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    console.log('Creating comment - taskId:', taskId, 'authorId:', authorId);

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignedUsers', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    console.log('Task found - createdBy:', task.createdBy?.id, 'assignedUsers:', task.assignedUsers?.map(u => u.id));

    const isCreator = task.createdBy.id === authorId;
    const isAssigned = task.assignedUsers.some(user => user.id === authorId);

    console.log('Permission check - isCreator:', isCreator, 'isAssigned:', isAssigned);

    if (!isCreator && !isAssigned) {
      throw new ForbiddenException('You can only comment on tasks you created or are assigned to');
    }

    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      task,
      author,
    });

    return this.commentRepository.save(comment);
  }

  async findByTaskId(taskId: string, query: CommentQueryDto): Promise<PaginatedResponse<Comment>> {
    const { page = 1, size = 10 } = query;
    const { page: validPage, size: validSize } = { page: Math.max(1, page || 1), size: Math.min(Math.max(1, size || 10), 100) };
    const offset = (validPage - 1) * validSize;

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { task: { id: taskId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: validSize,
    });

    return {
      data: comments,
      total,
      page: validPage,
      size: validSize,
      totalPages: Math.ceil(total / validSize),
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'task', 'task.createdBy', 'task.assignedUsers'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isCommentAuthor = comment.author.id === userId;
    const isTaskCreator = comment.task.createdBy.id === userId;
    const isTaskAssigned = comment.task.assignedUsers.some(user => user.id === userId);

    if (!isCommentAuthor && !isTaskCreator && !isTaskAssigned) {
      throw new ForbiddenException('You can only delete your own comments or comments on tasks you manage');
    }

    await this.commentRepository.remove(comment);
  }
}

