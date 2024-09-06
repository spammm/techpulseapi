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
import { PostImage } from '../post-images/post-image.entity';

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

  @OneToMany(() => PostImage, (image) => image.post)
  imageLinksEntity: PostImage[];

  @Column('simple-json', { nullable: true })
  imageLinks: {
    src: string;
    alt: string;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  image: {
    id?: number;
    src: string;
    alt: string;
    sourceUrl?: string;
    source?: string;
  };

  @Column('simple-json')
  sources: { name: string; link: string }[];

  @Column({ default: false })
  published: boolean;

  @Column()
  url: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  owner: User;

  @Column({ default: false })
  showAuthorName: boolean;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  telegramMessageId?: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  private originalPublished: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeTags() {
    if (this.tags && this.tags.length > 0) {
      this.tags = this.tags.map((tag) =>
        tag.toLowerCase().replace(/\s+/g, '_'),
      );
    }
  }

  @BeforeInsert()
  setCreationDates() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    if (this.published) {
      this.publishedAt = new Date();
    }
    this.originalPublished = this.published;
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
    if (this.published && !this.originalPublished) {
      this.publishedAt = new Date();
    }
    this.originalPublished = this.published;
  }
}
