import { Task, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { validate } from './config/config.validation';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('app.database.host'),
        port: configService.get('app.database.port'),
        username: configService.get('app.database.username'),
        password: configService.get('app.database.password'),
        database: configService.get('app.database.database'),
        entities: [User, Task],
        synchronize: configService.get('app.nodeEnv') !== 'production',
        logging: configService.get('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule { }

