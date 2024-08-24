import { Comment } from '../comments/comment.entity';
import { Post } from '../posts/post.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'admin' | 'writer' | 'manager' | 'client' | 'user';

  @Column({ default: '/avatar.webp' })
  avatar?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  publicAlias?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true })
  about?: string;

  @Column({ default: false })
  disable?: boolean;

  @Column('json', { nullable: true })
  contacts?: { name: string; value: string }[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
