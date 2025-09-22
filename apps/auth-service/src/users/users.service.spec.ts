import { User, UserRole } from '@jungle-gaming/entities'
import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDto } from '../auth/dto/create-user.dto'
import { UsersService } from './users.service'

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

describe('UsersService', () => {
  let service: UsersService
  let userRepository: Repository<User>

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))

    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
        role: UserRole.USER,
      }

      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue(mockUser)

      const result = await service.create(createUserDto)

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createUserDto.email }, { username: createUserDto.username }],
      })
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto)
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Password123',
      }

      const existingUser = { ...mockUser, email: 'existing@example.com' }
      mockUserRepository.findOne.mockResolvedValue(existingUser)

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createUserDto.email }, { username: createUserDto.username }],
      })
    })

    it('should throw ConflictException when username already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        username: 'existinguser',
        password: 'Password123',
      }

      const existingUser = { ...mockUser, username: 'existinguser' }
      mockUserRepository.findOne.mockResolvedValue(existingUser)

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createUserDto.email }, { username: createUserDto.username }],
      })
    })
  })

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByEmail('test@example.com')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.findByEmail('nonexistent@example.com')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      })
      expect(result).toBeNull()
    })
  })

  describe('findById', () => {
    it('should return user when found by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findById('user-id')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.findById('nonexistent-id')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' }
      })
      expect(result).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should return user when found by username', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByUsername('testuser')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found by username', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      const result = await service.findByUsername('nonexistentuser')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistentuser' }
      })
      expect(result).toBeNull()
    })
  })

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(true)

      const result = await service.validatePassword('password', 'hashedPassword')

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword')
      expect(result).toBe(true)
    })

    it('should return false when password is invalid', async () => {
      const bcrypt = require('bcryptjs')
      bcrypt.compare.mockResolvedValue(false)

      const result = await service.validatePassword('wrongpassword', 'hashedPassword')

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword')
      expect(result).toBe(false)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser]
      mockUserRepository.find.mockResolvedValue(users)

      const result = await service.findAll()

      expect(mockUserRepository.find).toHaveBeenCalled()
      expect(result).toEqual(users)
    })
  })

  describe('findAllWithTaskStats', () => {
    it('should return users with task stats', async () => {
      const users = [mockUser]
      mockUserRepository.find.mockResolvedValue(users)

      const result = await service.findAllWithTaskStats()

      expect(mockUserRepository.find).toHaveBeenCalled()
      expect(result).toEqual([
        {
          id: mockUser.id,
          name: mockUser.username,
          username: mockUser.username,
          email: mockUser.email,
          image: undefined,
          todo: 0,
          inProgress: 0,
          review: 0,
          done: 0,
          total: 0,
        }
      ])
    })

    it('should return empty array when no users found', async () => {
      mockUserRepository.find.mockResolvedValue([])

      const result = await service.findAllWithTaskStats()

      expect(mockUserRepository.find).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})