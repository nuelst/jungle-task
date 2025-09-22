import { AuthResponse } from '@jungle-gaming/types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OverviewService } from '../overview/overview.service';
import { UsersStatsService } from '../users/users-stats.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersStatsService: UsersStatsService,
    private readonly overviewService: OverviewService,
  ) { }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  health() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: ['JWT', 'PostgreSQL', 'Real Auth']
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getUsers(): Promise<any[]> {
    return this.authService.getAllUsers();
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Get users with task statistics' })
  @ApiResponse({ status: 200, description: 'Users with their task statistics' })
  async getUsersWithStats(): Promise<any[]> {
    console.log('Getting users with stats...');
    const result = await this.usersStatsService.getUsersWithTaskStats();
    console.log('Users with stats result:', result);
    return result;
  }

  @Get('debug/users')
  @ApiOperation({ summary: 'Debug endpoint - get users info' })
  @ApiResponse({ status: 200, description: 'Debug information about users' })
  async debugUsers(): Promise<any> {
    const users = await this.authService.getAllUsers();
    console.log('Debug - All users:', users);
    return {
      count: users.length,
      users: users.map(u => ({ id: u.id, username: u.username, email: u.email }))
    };
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get system overview statistics' })
  @ApiResponse({ status: 200, description: 'System overview with task and user statistics' })
  async getSystemOverview() {
    console.log('Overview endpoint called');
    return await this.overviewService.getSystemOverview();
  }

  @MessagePattern('auth.register')
  async registerMicroservice(data: { createUserDto: CreateUserDto }): Promise<AuthResponse> {
    return this.authService.register(data.createUserDto);
  }

  @MessagePattern('auth.login')
  async loginMicroservice(data: { loginDto: LoginDto }): Promise<AuthResponse> {
    return this.authService.login(data.loginDto);
  }

  @MessagePattern('auth.refresh')
  async refreshMicroservice(data: { refreshTokenDto: RefreshTokenDto }): Promise<AuthResponse> {
    return this.authService.refreshToken(data.refreshTokenDto);
  }

  @MessagePattern('auth.profile')
  async profileMicroservice(data: { token: string }): Promise<any> {
    return this.authService.validateTokenAndGetUser(data.token);
  }

  @MessagePattern('auth.users')
  async getUsersMicroservice(): Promise<any[]> {
    return this.authService.getAllUsers();
  }
}