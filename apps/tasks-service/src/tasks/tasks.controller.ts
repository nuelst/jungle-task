import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    @Inject('EVENTS_SERVICE') private readonly eventsClient: ClientProxy,
  ) { }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'tasks-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Post('test-rabbitmq')
  async testRabbitMQ() {
    const testEvent = {
      id: 'test-123',
      title: 'Test RabbitMQ Event',
      description: 'Testing RabbitMQ communication',
      createdAt: new Date().toISOString(),
      userId: 'test-user-123'
    };

    this.eventsClient.emit('task.created', testEvent);

    return {
      message: 'RabbitMQ test event sent',
      event: testEvent,
      timestamp: new Date().toISOString()
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    const userId = req.user.id;

    try {
      const task = await this.tasksService.create(createTaskDto, userId);

      this.eventsClient.emit('task.created', task);

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  @Get()
  async findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)
  async findUserTasks(@Query() query: TaskQueryDto, @Request() req: any) {
    const userId = req.user.id;
    return this.tasksService.findUserTasks(userId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const task = await this.tasksService.update(id, updateTaskDto, userId);

    this.eventsClient.emit('task.updated', task);

    return task;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.tasksService.remove(id, userId);
  }

  @MessagePattern('tasks.findAll')
  async findAllMicroservice(data: { query: TaskQueryDto }) {
    return this.tasksService.findAll(data.query);
  }

  @MessagePattern('tasks.findOne')
  async findOneMicroservice(data: { id: string }) {
    return this.tasksService.findOne(data.id);
  }

  @MessagePattern('tasks.create')
  async createMicroservice(data: { createTaskDto: CreateTaskDto; userId: string }) {
    const task = await this.tasksService.create(data.createTaskDto, data.userId);

    this.eventsClient.emit('task.created', task);

    return task;
  }

  @MessagePattern('tasks.update')
  async updateMicroservice(data: { id: string; updateTaskDto: UpdateTaskDto; userId: string }) {
    const task = await this.tasksService.update(data.id, data.updateTaskDto, data.userId);

    this.eventsClient.emit('task.updated', task);

    return task;
  }

  @MessagePattern('tasks.remove')
  async removeMicroservice(data: { id: string; userId: string }) {
    return this.tasksService.remove(data.id, data.userId);
  }

  @MessagePattern('tasks.findUserTasks')
  async findUserTasksMicroservice(data: { userId: string; query: TaskQueryDto }) {
    return this.tasksService.findUserTasks(data.userId, data.query);
  }
}

