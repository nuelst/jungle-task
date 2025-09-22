import { User, UserRole } from '@jungle-gaming/entities'
import { JwtPayload } from '@jungle-gaming/types'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let service: AuthService
  let userRepository: Repository<User>
  let jwtService: JwtService

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    toJSON: jest.fn().mockReturnThis(),
  } as any

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    jwtService = module.get<JwtService>(JwtService)

    // clear all mocks
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        role: UserRole.USER,
      }

      const bcrypt = require('bcryptjs')
      bcrypt.hash.mockResolvedValue('hashedPassword')

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token')

      const result = await service.register(createUserDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        username: createUserDto.username,
        password: 'hashedPassword',
        role: createUserDto.role,
      })
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      })
    })

    it('should throw ConflictException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123',
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      })
    })

    it('should throw error when user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
      }

      const bcrypt = require('bcryptjs')
      bcrypt.hash.mockResolvedValue('hashedPassword')

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(service.register(createUserDto)).rejects.toThrow('Failed to create user')
    })
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      }

      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(true)

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token')

      const result = await service.login(loginDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email }
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password)
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      }

      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email }
      })
    })

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)

      mockUserRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password)
    })
  })

  describe('refreshToken', () => {
    it('should successfully refresh token with valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      }

      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      }

      mockJwtService.verify.mockReturnValue(payload)
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token')

      const result = await service.refreshToken(refreshTokenDto)

      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      })
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub }
      })
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      }

      const payload: JwtPayload = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      }

      mockJwtService.verify.mockReturnValue(payload)
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      }

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('should return user data when user exists', async () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.validateUser(payload)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub }
      })
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      }

      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateTokenAndGetUser', () => {
    it('should return user data when token is valid', async () => {
      const token = 'valid-token'
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        iat: 1234567890,
        exp: 1234567890,
      }

      mockJwtService.verify.mockReturnValue(payload)
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.validateTokenAndGetUser(token)

      expect(mockJwtService.verify).toHaveBeenCalledWith(token)
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
    })

    it('should throw UnauthorizedException when token is invalid', async () => {
      const token = 'invalid-token'

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.validateTokenAndGetUser(token)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('getAllUsers', () => {
    it('should return all users with selected fields', async () => {
      const users = [mockUser]
      mockUserRepository.find.mockResolvedValue(users)

      const result = await service.getAllUsers()

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username', 'role', 'createdAt', 'updatedAt']
      })
      expect(result).toEqual(users)
    })
  })

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.USER,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token')

      const result = service['generateTokens'](user)

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        {
          secret: process.env.JWT_SECRET || 'secret',
          expiresIn: '1h'
        }
      )
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
          expiresIn: '7d'
        }
      )
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    })
  })
})