import { Task, User } from '@jungle-gaming/entities';
import { PaginatedResponse } from '@jungle-gaming/types';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createTaskDto: CreateTaskDto, createdById: string): Promise<Task> {
    const { assignedUserIds, ...taskData } = createTaskDto;

    // Find assigned users
    const assignedUsers = await this.userRepository.find({
      where: { id: In(assignedUserIds) },
    });

    // Find or create creator
    let createdBy = await this.userRepository.findOne({
      where: { id: createdById },
    });

    if (!createdBy) {
      // Create a basic user if not found (in a real app, this would sync from auth service)
      try {
        createdBy = this.userRepository.create({
          id: createdById,
          email: `user-${createdById}@example.com`,
          username: `user-${createdById}`,
        });
        createdBy = await this.userRepository.save(createdBy);
        console.log('Created user:', createdBy);
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

    const task = this.taskRepository.create({
      ...taskData,
      dueDate: new Date(createTaskDto.dueDate),
      assignedUsers,
      createdBy,
    });

    return this.taskRepository.save(task);
  }

  async findAll(query: TaskQueryDto): Promise<PaginatedResponse<Task>> {
    const { page = 1, size = 10, search, priority, status, assignedTo } = query;
    const validPage = Math.max(1, page || 1);
    const validSize = Math.min(Math.max(1, size || 10), 100);
    const offset = (validPage - 1) * validSize;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
    // .leftJoinAndSelect('task.comments', 'comments') // Temporariamente comentado
    // .leftJoinAndSelect('comments.author', 'commentAuthor');

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (assignedTo) {
      queryBuilder.andWhere('assignedUsers.id = :assignedTo', { assignedTo });
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(validSize)
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page: validPage,
      size: validSize,
      totalPages: Math.ceil(total / validSize),
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedUsers', 'createdBy'], // comments temporariamente removido
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);

    // Check if user is creator or assigned to task
    const isCreator = task.createdBy.id === userId;
    const isAssigned = task.assignedUsers.some(user => user.id === userId);

    if (!isCreator && !isAssigned) {
      throw new ForbiddenException('You can only update tasks you created or are assigned to');
    }

    if (updateTaskDto.assignedUserIds) {
      const assignedUsers = await this.userRepository.find({
        where: { id: In(updateTaskDto.assignedUserIds) },
      });
      task.assignedUsers = assignedUsers;
    }

    if (updateTaskDto.dueDate) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    // Update other fields
    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    // Only creator can delete task
    if (task.createdBy.id !== userId) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.taskRepository.remove(task);
  }

  async findUserTasks(userId: string, query: TaskQueryDto): Promise<PaginatedResponse<Task>> {
    const { page = 1, size = 10, search, priority, status } = query;
    const validPage = Math.max(1, page || 1);
    const validSize = Math.min(Math.max(1, size || 10), 100);
    const offset = (validPage - 1) * validSize;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      // .leftJoinAndSelect('task.comments', 'comments') // Temporariamente comentado
      // .leftJoinAndSelect('comments.author', 'commentAuthor')
      .where('assignedUsers.id = :userId OR createdBy.id = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(validSize)
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page: validPage,
      size: validSize,
      totalPages: Math.ceil(total / validSize),
    };
  }
}

