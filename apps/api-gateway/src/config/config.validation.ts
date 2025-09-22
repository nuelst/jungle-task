import { plainToClass, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT: number;

  @IsString()
  AUTH_SERVICE_URL: string;

  @IsString()
  TASKS_SERVICE_URL: string;

  @IsString()
  NOTIFICATIONS_SERVICE_URL: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  AUTH_SERVICE_TIMEOUT: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  TASKS_SERVICE_TIMEOUT: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  NOTIFICATIONS_SERVICE_TIMEOUT: number;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  FRONTEND_URL: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  THROTTLER_TTL: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  THROTTLER_LIMIT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
