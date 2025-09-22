import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '10000', 10),
    },
    tasks: {
      url: process.env.TASKS_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.TASKS_SERVICE_TIMEOUT || '10000', 10),
    },
    notifications: {
      url: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.NOTIFICATIONS_SERVICE_TIMEOUT || '10000', 10),
    },
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
    queues: {
      auth: 'auth_queue',
      tasks: 'tasks_queue',
      notifications: 'events_queue',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },

  throttler: {
    ttl: parseInt(process.env.THROTTLER_TTL || '1000', 10),
    limit: parseInt(process.env.THROTTLER_LIMIT || '10', 10),
  },
}));
