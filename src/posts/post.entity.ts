import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column({ nullable: true })
  keywords: string;

  @Column('text')
  content: string;

  @Column('simple-json')
  tags: string[];

  @Column('simple-json')
  imageLinks: { src: string; alt: string }[];

  @Column({ type: 'simple-json', nullable: true })
  image: { src: string; alt: string };

  @Column('simple-json')
  sources: { name: string; link: string }[];

  @Column()
  published: boolean;

  @Column()
  url: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  owner: User;

  @Column({ default: false })
  showAuthorName: boolean;

  @Column({ nullable: true })
  authorName: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @BeforeInsert()
  setCreationDates() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}