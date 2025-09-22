import { JwtPayload } from '@jungle-gaming/types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AuthResponseDto,
  CreateUserDto,
  LoginDto,
  RefreshResponseDto,
  RefreshTokenDto,
  UserResponseDto,
} from '../dto';
import { ProxyService } from '../gateway/services/proxy.service';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly proxyService: ProxyService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email, username, and password'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto
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
    status: 409,
    description: 'User already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.proxyService.authRegister(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password to get access and refresh tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid email or password' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.proxyService.authLogin(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access and refresh tokens using a valid refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid or expired refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.proxyService.authRefresh(refreshTokenDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get the profile information of the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto
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
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.proxyService.authProfile(user.sub);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get a list of all users in the system (requires authentication)'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto]
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
  async getUsers(): Promise<UserResponseDto[]> {
    return this.proxyService.authGetUsers();
  }

  @Get('users/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get users with task statistics',
    description: 'Get all users with their task statistics (requires authentication)'
  })
  @ApiResponse({
    status: 200,
    description: 'Users with statistics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          todo: { type: 'number' },
          inProgress: { type: 'number' },
          review: { type: 'number' },
          done: { type: 'number' },
          total: { type: 'number' }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  async getUsersWithStats(): Promise<any[]> {
    return this.proxyService.authGetUsersWithStats();
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get system overview statistics',
    description: 'Get system overview with task and user statistics (requires authentication)'
  })
  @ApiResponse({
    status: 200,
    description: 'System overview retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        totalTasks: { type: 'number' },
        tasksByStatus: {
          type: 'object',
          properties: {
            todo: { type: 'number' },
            inProgress: { type: 'number' },
            review: { type: 'number' },
            done: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  async getSystemOverview(): Promise<any> {
    return this.proxyService.authGetSystemOverview();
  }

  @Get('debug/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Debug endpoint - get users info',
    description: 'Get debug information about users (requires authentication)'
  })
  @ApiResponse({
    status: 200,
    description: 'Debug information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  async debugUsers(): Promise<any> {
    return this.proxyService.authDebugUsers();
  }
}

