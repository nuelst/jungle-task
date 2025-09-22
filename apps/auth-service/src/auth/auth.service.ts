import { User, UserRole } from '@jungle-gaming/entities';
import { AuthResponse, JwtPayload } from '@jungle-gaming/types';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const user = this.userRepository.create({
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role || UserRole.USER,
      });

      const savedUser = await this.userRepository.save(user) as unknown as User;

      return this.generateTokens({
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password || '');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Refresh token validation error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async validateTokenAndGetUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return await this.validateUser(payload);
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getAllUsers() {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt']
    });
    return users;
  }

  private generateTokens(user: any): AuthResponse {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '1h'
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d'
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

