import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

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
