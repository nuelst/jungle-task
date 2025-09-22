import { Comment, Task, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from './comments/comments.module';
import { validate } from './config/config.validation';
import configuration from './config/configuration';
import { TasksModule } from './tasks/tasks.module';

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
        entities: [User, Task, Comment],
        synchronize: configService.get('app.nodeEnv') !== 'production',
        logging: configService.get('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: { expiresIn: configService.get('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    CommentsModule,
  ],
})
export class AppModule { }

