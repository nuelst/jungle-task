import { JwtPayload } from '@jungle-gaming/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CommentListResponseDto,
  CommentQueryDto,
  CreateCommentDto,
  CreateTaskDto,
  TaskDto,
  TaskListResponseDto,
  TaskQueryDto,
  UpdateTaskDto,
} from '../../dto';
import { ProxyService } from '../services/proxy.service';

@ApiTags('Tasks')
@Controller('api/tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly proxyService: ProxyService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Create a new task with title, description, due date, priority, and assigned users'
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload, @Request() req: any): Promise<TaskDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.createTask(createTaskDto, token);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tasks',
    description: 'Get a paginated list of all tasks with optional filtering by search, priority, status, and assigned user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for title or description' })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Filter by priority (LOW, MEDIUM, HIGH, URGENT)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status (TODO, IN_PROGRESS, REVIEW, DONE)' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'Filter by assigned user ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: TaskListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async findAll(@Query() query: TaskQueryDto, @CurrentUser() user: JwtPayload, @Request() req: any): Promise<TaskListResponseDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.getTasks(query, token);
  }

  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user tasks',
    description: 'Get a paginated list of tasks assigned to the authenticated user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for title or description' })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Filter by priority (LOW, MEDIUM, HIGH, URGENT)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status (TODO, IN_PROGRESS, REVIEW, DONE)' })
  @ApiResponse({
    status: 200,
    description: 'User tasks retrieved successfully',
    type: TaskListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async findUserTasks(@Query() query: TaskQueryDto, @CurrentUser() user: JwtPayload, @Request() req: any): Promise<TaskListResponseDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.getMyTasks(query, token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Get a specific task by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskDto
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<TaskDto> {
    return this.proxyService.getTask(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update task',
    description: 'Update an existing task by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskDto
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to update this task',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Forbidden' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TaskDto> {
    return this.proxyService.updateTask(id, updateTaskDto, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete task',
    description: 'Delete a task by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task deleted successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to delete this task',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Forbidden' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    return this.proxyService.deleteTask(id, user.sub);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add comment to task',
    description: 'Add a comment to a specific task'
  })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '3ce72137-ac12-5c5f-c0cf-3948e3e3f69c' },
        content: { type: 'string', example: 'This task is progressing well.' },
        author: { type: 'object' },
        createdAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to comment on this task',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Forbidden' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<any> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.createTaskComment(id, createCommentDto, token);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get task comments',
    description: 'Get all comments for a specific task with pagination'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentListResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async getComments(
    @Param('id') id: string,
    @Query() query: CommentQueryDto,
    @CurrentUser() user: JwtPayload,
    @Request() req: any,
  ): Promise<CommentListResponseDto> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.getTaskComments(id, query, token);
  }
}

