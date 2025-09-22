import { AuthResponse } from '@jungle-gaming/types'
import { Test, TestingModule } from '@nestjs/testing'
import { OverviewService } from '../overview/overview.service'
import { UsersStatsService } from '../users/users-stats.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService
  let usersStatsService: UsersStatsService
  let overviewService: OverviewService

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getAllUsers: jest.fn(),
    validateTokenAndGetUser: jest.fn(),
  }

  const mockUsersStatsService = {
    getUsersWithTaskStats: jest.fn(),
  }

  const mockOverviewService = {
    getSystemOverview: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersStatsService,
          useValue: mockUsersStatsService,
        },
        {
          provide: OverviewService,
          useValue: mockOverviewService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
    usersStatsService = module.get<UsersStatsService>(UsersStatsService)
    overviewService = module.get<OverviewService>(OverviewService)

    jest.clearAllMocks()
  })

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health()

      expect(result).toEqual({
        status: 'ok',
        service: 'auth-service',
        timestamp: expect.any(String),
        version: '1.0.0',
        features: ['JWT', 'PostgreSQL', 'Real Auth']
      })
    })
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
      }

      const authResponse: AuthResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      }

      mockAuthService.register.mockResolvedValue(authResponse)

      const result = await controller.register(createUserDto)

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(authResponse)
    })
  })

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      }

      const authResponse: AuthResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      }

      mockAuthService.login.mockResolvedValue(authResponse)

      const result = await controller.login(loginDto)

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto)
      expect(result).toEqual(authResponse)
    })
  })

  describe('refresh', () => {
    it('should refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      }

      const authResponse: AuthResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      }

      mockAuthService.refreshToken.mockResolvedValue(authResponse)

      const result = await controller.refresh(refreshTokenDto)

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto)
      expect(result).toEqual(authResponse)
    })
  })

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: 'user-id-1',
          email: 'user1@example.com',
          username: 'user1',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-id-2',
          email: 'user2@example.com',
          username: 'user2',
          role: 'ADMIN' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      mockAuthService.getAllUsers.mockResolvedValue(users)

      const result = await controller.getUsers()

      expect(mockAuthService.getAllUsers).toHaveBeenCalled()
      expect(result).toEqual(users)
    })
  })

  describe('getUsersWithStats', () => {
    it('should return users with task stats', async () => {
      const usersWithStats = [
        {
          id: 'user-id-1',
          name: 'user1',
          username: 'user1',
          email: 'user1@example.com',
          todo: 5,
          inProgress: 3,
          review: 2,
          done: 10,
          total: 20,
        },
      ]

      mockUsersStatsService.getUsersWithTaskStats.mockResolvedValue(usersWithStats)

      const result = await controller.getUsersWithStats()

      expect(mockUsersStatsService.getUsersWithTaskStats).toHaveBeenCalled()
      expect(result).toEqual(usersWithStats)
    })
  })

  describe('debugUsers', () => {
    it('should return debug information about users', async () => {
      const users = [
        {
          id: 'user-id-1',
          email: 'user1@example.com',
          username: 'user1',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      mockAuthService.getAllUsers.mockResolvedValue(users)

      const result = await controller.debugUsers()

      expect(mockAuthService.getAllUsers).toHaveBeenCalled()
      expect(result).toEqual({
        count: 1,
        users: [{ id: 'user-id-1', username: 'user1', email: 'user1@example.com' }]
      })
    })
  })

  describe('getSystemOverview', () => {
    it('should return system overview', async () => {
      const overview = {
        totalUsers: 10,
        totalTasks: 50,
        systemStatus: 'healthy',
      }

      mockOverviewService.getSystemOverview.mockResolvedValue(overview)

      const result = await controller.getSystemOverview()

      expect(mockOverviewService.getSystemOverview).toHaveBeenCalled()
      expect(result).toEqual(overview)
    })
  })

  describe('Microservice endpoints', () => {
    describe('registerMicroservice', () => {
      it('should register user via microservice', async () => {
        const data = {
          createUserDto: {
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123',
          } as CreateUserDto
        }

        const authResponse: AuthResponse = {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'USER' as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        }

        mockAuthService.register.mockResolvedValue(authResponse)

        const result = await controller.registerMicroservice(data)

        expect(mockAuthService.register).toHaveBeenCalledWith(data.createUserDto)
        expect(result).toEqual(authResponse)
      })
    })

    describe('loginMicroservice', () => {
      it('should login user via microservice', async () => {
        const data = {
          loginDto: {
            email: 'test@example.com',
            password: 'Password123',
          } as LoginDto
        }

        const authResponse: AuthResponse = {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'USER' as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        }

        mockAuthService.login.mockResolvedValue(authResponse)

        const result = await controller.loginMicroservice(data)

        expect(mockAuthService.login).toHaveBeenCalledWith(data.loginDto)
        expect(result).toEqual(authResponse)
      })
    })

    describe('refreshMicroservice', () => {
      it('should refresh token via microservice', async () => {
        const data = {
          refreshTokenDto: {
            refreshToken: 'refresh-token',
          } as RefreshTokenDto
        }

        const authResponse: AuthResponse = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: {
            id: 'user-id',
            email: 'test@example.com',
            username: 'testuser',
            role: 'USER' as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        }

        mockAuthService.refreshToken.mockResolvedValue(authResponse)

        const result = await controller.refreshMicroservice(data)

        expect(mockAuthService.refreshToken).toHaveBeenCalledWith(data.refreshTokenDto)
        expect(result).toEqual(authResponse)
      })
    })

    describe('profileMicroservice', () => {
      it('should get user profile via microservice', async () => {
        const data = {
          token: 'valid-token'
        }

        const userProfile = {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER' as any,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockAuthService.validateTokenAndGetUser.mockResolvedValue(userProfile)

        const result = await controller.profileMicroservice(data)

        expect(mockAuthService.validateTokenAndGetUser).toHaveBeenCalledWith(data.token)
        expect(result).toEqual(userProfile)
      })
    })

    describe('getUsersMicroservice', () => {
      it('should get all users via microservice', async () => {
        const users = [
          {
            id: 'user-id-1',
            email: 'user1@example.com',
            username: 'user1',
            role: 'USER' as any,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ]

        mockAuthService.getAllUsers.mockResolvedValue(users)

        const result = await controller.getUsersMicroservice()

        expect(mockAuthService.getAllUsers).toHaveBeenCalled()
        expect(result).toEqual(users)
      })
    })
  })
})