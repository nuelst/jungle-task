import { User, UserRole } from '@jungle-gaming/entities';
import 'reflect-metadata';
import AppDataSource from './data-source';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding');

    const userRepository = AppDataSource.getRepository(User);

    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    const testUsers = [
      {
        email: 'admin@junglegaming.io',
        username: 'admin',
        password: 'Admin123!',
        role: UserRole.ADMIN,
      },
      {
        email: 'user@junglegaming.io',
        username: 'user',
        password: 'User123!',
        role: UserRole.USER,
      },
    ];

    for (const userData of testUsers) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${user.email} with role: ${user.role}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();

