import { Task, User } from '@jungle-gaming/entities'
import { TaskPriority, TaskStatus } from '@jungle-gaming/types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
// import { Repository } from 'typeorm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService
  // let taskRepository: Repository<Task>
  // let userRepository: Repository<User>

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: () => ({ id: 'user-id', email: 'test@example.com', username: 'testuser', role: 'USER' as any, createdAt: new Date(), updatedAt: new Date() })
  }

  const mockTask = {
    id: 'task-id',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date('2024-12-31'),
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    createdBy: mockUser,
    assignedUsers: [mockUser],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockQueryBuilder = {
    createQueryBuilder: vi.fn().mockReturnThis(),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn().mockResolvedValue([[mockTask], 1])
  }

  const mockTaskRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder)
  }

  const mockUserRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        }
      ]
    }).compile()

    service = module.get<TasksService>(TasksService)
    // taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task))
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User))

    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should successfully create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2024-12-31',
        priority: TaskPriority.HIGH,
        assignedUserIds: ['user-id']
      }

      mockUserRepository.find.mockResolvedValue([mockUser])
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockTaskRepository.create.mockReturnValue(mockTask)
      mockTaskRepository.save.mockResolvedValue(mockTask)

      const result = await service.create(createTaskDto, 'user-id')

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'in', _value: ['user-id'] }) }
      })
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' }
      })
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        dueDate: new Date(createTaskDto.dueDate),
        assignedUsers: [mockUser],
        createdBy: mockUser
      })
      expect(mockTaskRepository.save).toHaveBeenCalledWith(mockTask)
      expect(result).toEqual(mockTask)
    })

    it('should create user when creator not found', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2024-12-31',
        priority: TaskPriority.HIGH,
        assignedUserIds: ['user-id']
      }

      const createdUser = {
        id: 'nonexistent-id',
        email: 'user-nonexistent-id@example.com',
        username: 'user-nonexistent-id',
        role: 'USER' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({ id: 'nonexistent-id', email: 'user-nonexistent-id@example.com', username: 'user-nonexistent-id', role: 'USER' as any, createdAt: new Date(), updatedAt: new Date() })
      }

      mockUserRepository.find.mockResolvedValue([mockUser])
      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(createdUser)
      mockUserRepository.save.mockResolvedValue(createdUser)
      mockTaskRepository.create.mockReturnValue(mockTask)
      mockTaskRepository.save.mockResolvedValue(mockTask)

      const result = await service.create(createTaskDto, 'nonexistent-id')

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' }
      })
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        id: 'nonexistent-id',
        email: 'user-nonexistent-id@example.com',
        username: 'user-nonexistent-id',
      })
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser)
      expect(result).toEqual(mockTask)
    })
  })

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const query = { page: 1, size: 10 }

      const result = await service.findAll(query)

      expect(mockTaskRepository.createQueryBuilder).toHaveBeenCalledWith('task')
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('task.assignedUsers', 'assignedUsers')
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('task.createdBy', 'createdBy')
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC')
      expect(result).toEqual({
        data: [mockTask],
        total: 1,
        page: 1,
        size: 10,
        totalPages: 1
      })
    })

    it('should apply search filter', async () => {
      const query = { page: 1, size: 10, search: 'test' }

      await service.findAll(query)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: '%test%' }
      )
    })

    it('should apply priority filter', async () => {
      const query = { page: 1, size: 10, priority: TaskPriority.HIGH }

      await service.findAll(query)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.priority = :priority', { priority: TaskPriority.HIGH })
    })

    it('should apply status filter', async () => {
      const query = { page: 1, size: 10, status: TaskStatus.IN_PROGRESS }

      await service.findAll(query)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: TaskStatus.IN_PROGRESS })
    })

    it('should apply assignedTo filter', async () => {
      const query = { page: 1, size: 10, assignedTo: 'user-id' }

      await service.findAll(query)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('assignedUsers.id = :assignedTo', { assignedTo: 'user-id' })
    })
  })

  describe('findOne', () => {
    it('should return task when found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask)

      const result = await service.findOne('task-id')

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-id' },
        relations: ['assignedUsers', 'createdBy']
      })
      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundException when task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException)
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
        relations: ['assignedUsers', 'createdBy']
      })
    })
  })

  describe('update', () => {
    it('should successfully update task when user is creator', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS
      }

      vi.spyOn(service, 'findOne').mockResolvedValue(mockTask)
      mockTaskRepository.save.mockResolvedValue({ ...mockTask, ...updateTaskDto })

      const result = await service.update('task-id', updateTaskDto, 'user-id')

      expect(service.findOne).toHaveBeenCalledWith('task-id')
      expect(mockTaskRepository.save).toHaveBeenCalled()
      expect(result.title).toBe('Updated Task')
      expect(result.status).toBe(TaskStatus.IN_PROGRESS)
    })

    it('should successfully update task when user is assigned', async () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE
      }

      const taskWithDifferentCreator = {
        ...mockTask,
        createdBy: { ...mockUser, id: 'different-user-id' },
        assignedUsers: [mockUser] // Current user is assigned
      }

      vi.spyOn(service, 'findOne').mockResolvedValue(taskWithDifferentCreator)
      mockTaskRepository.save.mockResolvedValue({ ...taskWithDifferentCreator, ...updateTaskDto })

      const result = await service.update('task-id', updateTaskDto, 'user-id')

      expect(service.findOne).toHaveBeenCalledWith('task-id')
      expect(mockTaskRepository.save).toHaveBeenCalled()
      expect(result.status).toBe(TaskStatus.DONE)
    })

    it('should throw ForbiddenException when user is not creator or assigned', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task'
      }

      const taskWithDifferentCreatorAndAssignees = {
        ...mockTask,
        createdBy: { ...mockUser, id: 'different-user-id' },
        assignedUsers: [{ ...mockUser, id: 'another-user-id' }]
      }

      vi.spyOn(service, 'findOne').mockResolvedValue(taskWithDifferentCreatorAndAssignees)

      await expect(service.update('task-id', updateTaskDto, 'user-id')).rejects.toThrow(ForbiddenException)
      expect(service.findOne).toHaveBeenCalledWith('task-id')
      expect(mockTaskRepository.save).not.toHaveBeenCalled()
    })

    it('should update assigned users when provided', async () => {
      const updateTaskDto: UpdateTaskDto = {
        assignedUserIds: ['new-user-id']
      }

      const newUser = { ...mockUser, id: 'new-user-id' }
      vi.spyOn(service, 'findOne').mockResolvedValue(mockTask)
      mockUserRepository.find.mockResolvedValue([newUser])
      mockTaskRepository.save.mockResolvedValue({ ...mockTask, assignedUsers: [newUser] })

      const result = await service.update('task-id', updateTaskDto, 'user-id')

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'in', _value: ['new-user-id'] }) }
      })
      expect(result.assignedUsers).toEqual([newUser])
    })
  })

  describe('remove', () => {
    it('should successfully remove task when user is creator', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockTask)
      mockTaskRepository.remove.mockResolvedValue(mockTask)

      await service.remove('task-id', 'user-id')

      expect(service.findOne).toHaveBeenCalledWith('task-id')
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask)
    })

    it('should throw ForbiddenException when user is not creator', async () => {
      const taskWithDifferentCreator = {
        ...mockTask,
        createdBy: { ...mockUser, id: 'different-user-id' }
      }

      vi.spyOn(service, 'findOne').mockResolvedValue(taskWithDifferentCreator)

      await expect(service.remove('task-id', 'user-id')).rejects.toThrow(ForbiddenException)
      expect(service.findOne).toHaveBeenCalledWith('task-id')
      expect(mockTaskRepository.remove).not.toHaveBeenCalled()
    })
  })

  describe('findUserTasks', () => {
    it('should return tasks where user is creator or assigned', async () => {
      const query = { page: 1, size: 10 }

      const result = await service.findUserTasks('user-id', query)

      expect(mockTaskRepository.createQueryBuilder).toHaveBeenCalledWith('task')
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'assignedUsers.id = :userId OR createdBy.id = :userId',
        { userId: 'user-id' }
      )
      expect(result).toEqual({
        data: [mockTask],
        total: 1,
        page: 1,
        size: 10,
        totalPages: 1
      })
    })
  })
})
