// User types
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

// Task types
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUsers: User[];
  comments: Comment[];
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  assignedUserIds: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedUserIds?: string[];
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  task: Task;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
}

// Pagination types
export interface PaginationDto {
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface TaskCreatedEvent {
  type: 'task:created';
  payload: Task;
}

export interface TaskUpdatedEvent {
  type: 'task:updated';
  payload: Task;
}

export interface CommentCreatedEvent {
  type: 'comment:new';
  payload: {
    taskId: string;
    comment: Comment;
  };
}

// RabbitMQ message types
export interface RabbitMQMessage {
  pattern: string;
  data: any;
}

export interface TaskCreatedMessage {
  pattern: 'task.created';
  data: Task;
}

export interface TaskUpdatedMessage {
  pattern: 'task.updated';
  data: Task;
}

export interface CommentCreatedMessage {
  pattern: 'task.comment.created';
  data: {
    taskId: string;
    comment: Comment;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Frontend query DTOs and types used by web
export interface TaskQueryDto {
  page?: number;
  size?: number;
  search?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
}

export interface CommentQueryDto {
  page?: number;
  size?: number;
}

// Notification entity minimal type for web
export interface Notification {
  id: string;
  type: 'task:created' | 'task:updated' | 'comment:new';
  title: string;
  message: string;
  data: any;
  status?: 'unread' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

