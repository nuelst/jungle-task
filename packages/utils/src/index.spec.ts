import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DateUtils,
  JwtUtils,
  PaginationUtils,
  PasswordUtils,
  StringUtils,
  ValidationUtils
} from './index'

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn()
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn()
}))

describe('PasswordUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hash', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'password123'
      const hashedPassword = 'hashed-password'

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never)

      const result = await PasswordUtils.hash(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(hashedPassword)
    })
  })

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'password123'
      const hash = 'hashed-password'

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const result = await PasswordUtils.compare(password, hash)

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(true)
    })

    it('should return false for non-matching password', async () => {
      const password = 'wrongpassword'
      const hash = 'hashed-password'

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await PasswordUtils.compare(password, hash)

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(false)
    })
  })
})

describe('JwtUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
  })

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload and options', () => {
      const payload = { sub: 'user-id', email: 'test@example.com', username: 'testuser' }
      const token = 'generated-token'

      vi.mocked(jwt.sign).mockReturnValue(token as never)

      const result = JwtUtils.generateAccessToken(payload)

      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '15m' })
      expect(result).toBe(token)
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload and options', () => {
      const payload = { sub: 'user-id', email: 'test@example.com', username: 'testuser' }
      const token = 'generated-refresh-token'

      vi.mocked(jwt.sign).mockReturnValue(token as never)

      const result = JwtUtils.generateRefreshToken(payload)

      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-refresh-secret', { expiresIn: '7d' })
      expect(result).toBe(token)
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify access token with correct secret', () => {
      const token = 'valid-token'
      const payload = { sub: 'user-id', email: 'test@example.com', username: 'testuser' }

      vi.mocked(jwt.verify).mockReturnValue(payload as never)

      const result = JwtUtils.verifyAccessToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret')
      expect(result).toEqual(payload)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify refresh token with correct secret', () => {
      const token = 'valid-refresh-token'
      const payload = { sub: 'user-id', email: 'test@example.com', username: 'testuser' }

      vi.mocked(jwt.verify).mockReturnValue(payload as never)

      const result = JwtUtils.verifyRefreshToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret')
      expect(result).toEqual(payload)
    })
  })
})

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true)
      expect(ValidationUtils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false)
      expect(ValidationUtils.isValidEmail('test@')).toBe(false)
      expect(ValidationUtils.isValidEmail('@domain.com')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should return true for valid password', () => {
      expect(ValidationUtils.isValidPassword('Password123')).toBe(true)
      expect(ValidationUtils.isValidPassword('MySecure1')).toBe(true)
    })

    it('should return false for invalid password', () => {
      expect(ValidationUtils.isValidPassword('password')).toBe(false)
      expect(ValidationUtils.isValidPassword('PASSWORD')).toBe(false)
      expect(ValidationUtils.isValidPassword('Pass1')).toBe(false)
      expect(ValidationUtils.isValidPassword('12345678')).toBe(false)
    })
  })

  describe('isValidUsername', () => {
    it('should return true for valid username', () => {
      expect(ValidationUtils.isValidUsername('testuser')).toBe(true)
      expect(ValidationUtils.isValidUsername('user_123')).toBe(true)
      expect(ValidationUtils.isValidUsername('User123')).toBe(true)
    })

    it('should return false for invalid username', () => {
      expect(ValidationUtils.isValidUsername('ab')).toBe(false)
      expect(ValidationUtils.isValidUsername('a'.repeat(21))).toBe(false)
      expect(ValidationUtils.isValidUsername('user-name')).toBe(false)
      expect(ValidationUtils.isValidUsername('user name')).toBe(false)
    })
  })
})

describe('DateUtils', () => {
  describe('isDateInFuture', () => {
    it('should return true for future date', () => {
      const futureDate = new Date(Date.now() + 86400000)
      expect(DateUtils.isDateInFuture(futureDate)).toBe(true)
    })

    it('should return false for past date', () => {
      const pastDate = new Date(Date.now() - 86400000)
      expect(DateUtils.isDateInFuture(pastDate)).toBe(false)
    })
  })

  describe('addDays', () => {
    it('should add days to date correctly', () => {
      const date = new Date('2024-01-01')
      const result = DateUtils.addDays(date, 5)

      expect(result.getDate()).toBe(6)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should subtract days when negative number provided', () => {
      const date = new Date('2024-01-10')
      const result = DateUtils.addDays(date, -5)

      expect(result.getDate()).toBe(5)
      expect(result.getMonth()).toBe(0)
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = DateUtils.formatDate(date)

      expect(result).toBe('2024-01-15')
    })
  })

  describe('formatDateTime', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = DateUtils.formatDateTime(date)

      expect(result).toBe('2024-01-15T10:30:00.000Z')
    })
  })
})

describe('PaginationUtils', () => {
  describe('calculateOffset', () => {
    it('should calculate offset correctly', () => {
      expect(PaginationUtils.calculateOffset(1, 10)).toBe(0)
      expect(PaginationUtils.calculateOffset(2, 10)).toBe(10)
      expect(PaginationUtils.calculateOffset(3, 20)).toBe(40)
    })
  })

  describe('calculateTotalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(PaginationUtils.calculateTotalPages(100, 10)).toBe(10)
      expect(PaginationUtils.calculateTotalPages(95, 10)).toBe(10)
      expect(PaginationUtils.calculateTotalPages(101, 10)).toBe(11)
      expect(PaginationUtils.calculateTotalPages(0, 10)).toBe(0)
    })
  })

  describe('validatePagination', () => {
    it('should return valid pagination parameters', () => {
      const result = PaginationUtils.validatePagination(2, 20)
      expect(result).toEqual({ page: 2, size: 20 })
    })

    it('should correct invalid page number', () => {
      const result = PaginationUtils.validatePagination(0, 20)
      expect(result).toEqual({ page: 1, size: 20 })

      const result2 = PaginationUtils.validatePagination(-5, 20)
      expect(result2).toEqual({ page: 1, size: 20 })
    })

    it('should correct invalid size', () => {
      const result = PaginationUtils.validatePagination(1, 0)
      expect(result).toEqual({ page: 1, size: 1 })

      const result2 = PaginationUtils.validatePagination(1, 150)
      expect(result2).toEqual({ page: 1, size: 100 })
    })
  })
})

describe('StringUtils', () => {
  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(StringUtils.slugify('Hello World')).toBe('hello-world')
      expect(StringUtils.slugify('Test Title 123')).toBe('test-title-123')
      expect(StringUtils.slugify('Special @#$ Characters!')).toBe('special-characters')
    })

    it('should handle edge cases', () => {
      expect(StringUtils.slugify('   Multiple   Spaces   ')).toBe('multiple-spaces')
      expect(StringUtils.slugify('---dashes---')).toBe('dashes')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(StringUtils.truncate(longText, 20)).toBe('This is a very lo...')
    })

    it('should return original text if shorter than max length', () => {
      const shortText = 'Short text'
      expect(StringUtils.truncate(shortText, 20)).toBe('Short text')
    })

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars'
      expect(StringUtils.truncate(text, 20)).toBe('Exactly twenty chars')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase rest', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello')
      expect(StringUtils.capitalize('HELLO')).toBe('Hello')
      expect(StringUtils.capitalize('hELLO wORLD')).toBe('Hello world')
    })

    it('should handle single character', () => {
      expect(StringUtils.capitalize('a')).toBe('A')
      expect(StringUtils.capitalize('A')).toBe('A')
    })

    it('should handle empty string', () => {
      expect(StringUtils.capitalize('')).toBe('')
    })
  })
})
