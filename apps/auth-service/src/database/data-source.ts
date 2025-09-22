import { User } from '@jungle-gaming/entities';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/challenge_db',
  entities: [User],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;

