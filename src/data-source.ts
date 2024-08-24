import { DataSource } from 'typeorm';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import { Tag } from './tags/tag.entity';
import { Comment } from './comments/comment.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Post, User, Comment, Tag],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  subscribers: [],
});
