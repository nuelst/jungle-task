import { Task, TaskStatus, User } from '@jungle-gaming/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTaskStats } from './users.service';

@Injectable()
export class UsersStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async getUsersWithTaskStats(): Promise<UserTaskStats[]> {
    const users = await this.userRepository.find();

    if (users.length === 0) {
      console.log('No users found in database');
      return [];
    }

    const result = await Promise.all(users.map(async (user) => {
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoin('task.assignedUsers', 'assignedUser')
        .where('assignedUser.id = :userId', { userId: user.id })
        .getMany();

      const todo = tasks.filter(task => task.status === TaskStatus.TODO).length;
      const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
      const review = tasks.filter(task => task.status === TaskStatus.REVIEW).length;
      const done = tasks.filter(task => task.status === TaskStatus.DONE).length;
      const total = todo + inProgress + review + done;

      return {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        image: undefined,
        todo,
        inProgress,
        review,
        done,
        total,
      };
    }));

    console.log('Processed users with real task stats:', result);
    return result;
  }
}
