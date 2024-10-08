import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Post } from './posts/post.entity';
import { User } from './users/user.entity';
import { Tag } from './tags/tag.entity';
import { Comment } from './comments/comment.entity';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const entities = [Post, User, Comment, Tag];
const migrationsPath = path.resolve(__dirname, '..', 'migrations/*{.ts,.js}');

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true',
  entities: entities,
  migrations: [migrationsPath],
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
};

export const AppDataSource = new DataSource(dataSourceOptions);
