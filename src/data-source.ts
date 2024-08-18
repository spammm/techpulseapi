import { DataSource } from 'typeorm';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Post, User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  subscribers: [],
});
