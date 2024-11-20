import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Topics } from '../enums/topics.enum';
import { User } from 'src/auth/entities/user.entity';

@Entity()
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column('int', { default: 0 })
  votes: number;

  @Column({
    type: 'enum',
    enum: Topics,
    nullable: false,
  })
  topic: Topics;

  @ManyToOne(() => User, (user) => user.commentaries)
  user: User;
}
