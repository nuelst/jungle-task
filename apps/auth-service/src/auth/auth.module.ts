import { Task, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverviewModule } from '../overview/overview.module';
import { UsersStatsService } from '../users/users-stats.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Task]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: { expiresIn: configService.get('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    OverviewModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersStatsService],
  exports: [AuthService, UsersStatsService],
})
export class AuthModule { }

