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

  @Column({ nullable: true, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'admin' | 'writer' | 'manager' | 'client' | 'user' | 'guest';

  @Column({ default: '/avatar.webp' })
  avatar?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ default: false })
  isEmailConfirmed: boolean;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerId?: string;

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  images: any;
}
