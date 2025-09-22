import { useAuthStore } from '@/store/auth.store'
import {
  AuthResponse,
  Comment,
  CommentQueryDto,
  CreateCommentDto,
  CreateTaskDto,
  CreateUserDto,
  LoginDto,
  Notification,
  PaginatedResponse,
  RefreshTokenDto,
  Task,
  TaskQueryDto,
  UpdateTaskDto,
  User
} from '@jungle-gaming/types'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { webSocketService } from './websocket'

class ApiService {
  private readonly api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 10000,
    })

    this.api.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState()
        console.log('API Request - Token:', accessToken ? 'Present' : 'Missing')
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(new Error(error))
    )

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const { refreshToken } = useAuthStore.getState()
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken })
              useAuthStore.getState().login(response.data)

              webSocketService.reconnectWithNewToken()

              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
              return this.api(originalRequest)
            }
          } catch {
            useAuthStore.getState().logout()
            webSocketService.disconnect()
            window.location.href = '/login'
          }
        }

        return Promise.reject(new Error(error))
      }
    )
  }

  async register(data: CreateUserDto): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/api/auth/register', data)
  }

  async login(data: LoginDto): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/api/auth/login', data)
  }

  async refreshToken(data: RefreshTokenDto): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/api/auth/refresh', data)
  }

  async getProfile(): Promise<AxiosResponse<any>> {
    return this.api.get('/api/auth/profile')
  }

  async getTasks(query?: TaskQueryDto): Promise<AxiosResponse<PaginatedResponse<Task>>> {
    return this.api.get('/api/tasks', { params: query })
  }

  async getMyTasks(query?: TaskQueryDto): Promise<AxiosResponse<PaginatedResponse<Task>>> {
    return this.api.get('/api/tasks/my-tasks', { params: query })
  }

  async getTask(id: string): Promise<AxiosResponse<Task>> {
    return this.api.get(`/api/tasks/${id}`)
  }

  async createTask(data: CreateTaskDto): Promise<AxiosResponse<Task>> {
    return this.api.post('/api/tasks', data)
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<AxiosResponse<Task>> {
    return this.api.patch(`/api/tasks/${id}`, data)
  }

  async deleteTask(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/api/tasks/${id}`)
  }

  async getTaskComments(taskId: string, query?: CommentQueryDto): Promise<AxiosResponse<PaginatedResponse<Comment>>> {
    return this.api.get(`/api/tasks/${taskId}/comments`, { params: query })
  }

  async createTaskComment(taskId: string, data: CreateCommentDto): Promise<AxiosResponse<Comment>> {
    return this.api.post(`/api/tasks/${taskId}/comments`, data)
  }

  async deleteComment(commentId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/api/comments/${commentId}`)
  }

  async getNotifications(query?: { page?: number; size?: number }): Promise<AxiosResponse<PaginatedResponse<Notification>>> {
    return this.api.get('/api/notifications', { params: query })
  }

  async getUnreadCount(): Promise<AxiosResponse<{ count: number }>> {
    return this.api.get('/api/notifications/unread-count')
  }

  async markNotificationAsRead(id: string): Promise<AxiosResponse<Notification>> {
    return this.api.patch(`/api/notifications/${id}/read`)
  }

  async markAllNotificationsAsRead(): Promise<AxiosResponse<{ message: string }>> {
    return this.api.patch('/api/notifications/mark-all-read')
  }

  async deleteNotification(id: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(`/api/notifications/${id}`)
  }

  async getUsers(): Promise<AxiosResponse<User[]>> {
    return this.api.get('/api/auth/users')
  }

  async getUsersWithStats(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/api/auth/users/stats')
  }

  async debugUsers(): Promise<AxiosResponse<any>> {
    return this.api.get('/api/auth/debug/users')
  }

  async getSystemOverview(): Promise<AxiosResponse<any>> {
    return this.api.get('/api/auth/overview')
  }

  async createUser(userData: any): Promise<AxiosResponse<any>> {
    return this.api.post('/api/auth/register', userData)
  }
}

export const apiService = new ApiService()

