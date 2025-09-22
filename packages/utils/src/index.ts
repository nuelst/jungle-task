import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}

export class JwtUtils {
  static generateAccessToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', { expiresIn: '15m' })
  }

  static generateRefreshToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', { expiresIn: '7d' })
  }

  static verifyAccessToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
  }

  static verifyRefreshToken(token: string): any {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret')
  }
}

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }
}

export class DateUtils {
  static isDateInFuture(date: Date): boolean {
    return date > new Date();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatDateTime(date: Date): string {
    return date.toISOString();
  }
}

export class PaginationUtils {
  static calculateOffset(page: number, size: number): number {
    return (page - 1) * size;
  }

  static calculateTotalPages(total: number, size: number): number {
    return Math.ceil(total / size);
  }

  static validatePagination(page: number, size: number): { page: number; size: number } {
    const validPage = Math.max(1, page);
    const validSize = Math.min(Math.max(1, size), 100);
    return { page: validPage, size: validSize };
  }
}

export class StringUtils {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

