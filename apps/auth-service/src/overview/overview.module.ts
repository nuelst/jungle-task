import { Task, User } from '@jungle-gaming/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverviewService } from './overview.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  providers: [OverviewService],
  exports: [OverviewService],
})
export class OverviewModule { }
