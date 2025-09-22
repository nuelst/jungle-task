import { User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersStatsService } from './users-stats.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersStatsService],
  exports: [UsersService, UsersStatsService],
})
export class UsersModule { }

