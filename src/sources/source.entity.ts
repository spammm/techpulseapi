import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  link: string;
}
