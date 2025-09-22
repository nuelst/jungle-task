import { vi } from 'vitest'

global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_USERNAME = 'postgres'
process.env.DB_PASSWORD = 'password'
process.env.DB_NAME = 'test_db'
