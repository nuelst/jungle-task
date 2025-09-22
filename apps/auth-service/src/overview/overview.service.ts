import { Task, TaskStatus, User } from '@jungle-gaming/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface SystemOverview {
  totalTasks: number;
  totalUsers: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
}

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async getSystemOverview(): Promise<SystemOverview> {
    const totalUsers = await this.userRepository.count();
    const totalTasks = await this.taskRepository.count();

    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany();

    const statusCounts = {
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
    };

    tasksByStatus.forEach(({ status, count }) => {
      switch (status) {
        case TaskStatus.TODO:
          statusCounts.todo = parseInt(count);
          break;
        case TaskStatus.IN_PROGRESS:
          statusCounts.inProgress = parseInt(count);
          break;
        case TaskStatus.REVIEW:
          statusCounts.review = parseInt(count);
          break;
        case TaskStatus.DONE:
          statusCounts.done = parseInt(count);
          break;
      }
    });

    const result = {
      totalUsers,
      totalTasks,
      tasksByStatus: statusCounts,
    };

    console.log('System overview calculated with real data:', result);

    return result;
  }
}
