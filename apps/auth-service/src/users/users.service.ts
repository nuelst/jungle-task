import { User } from '@jungle-gaming/entities';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../auth/dto/create-user.dto';

export interface UserTaskStats {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  total: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAllWithTaskStats(): Promise<UserTaskStats[]> {
    const users = await this.userRepository.find();

    return users.map(user => ({
      id: user.id,
      name: user.username,
      username: user.username,
      email: user.email,
      image: undefined,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      total: 0,
    }));
  }
}

