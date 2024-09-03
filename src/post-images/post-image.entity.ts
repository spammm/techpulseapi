import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Entity()
export class PostImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @Column({ nullable: true })
  smallSrc: string;

  @Column()
  alt: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  sourceUrl?: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'int', nullable: true })
  smallWidth?: number;

  @Column({ type: 'int', nullable: true })
  smallHeight?: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.images)
  owner: User;

  @ManyToOne(() => Post, (post) => post.imageLinksEntity)
  post: Post;
}
