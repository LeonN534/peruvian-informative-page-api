import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Topics } from '../enums/topics.enum';
import { User } from 'src/auth/entities/user.entity';
import { CommentariesVotedByUsers } from './commentaries-voted-by-users.entity';

@Entity()
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column({
    type: 'enum',
    enum: Topics,
    nullable: false,
  })
  topic: Topics;

  @ManyToOne(() => User, (user) => user.commentaries)
  user: User;

  @OneToMany(
    () => CommentariesVotedByUsers,
    (commentariesVotedByUsers) => commentariesVotedByUsers.commentary,
    { eager: true },
  )
  public commentariesVotedByUsers: CommentariesVotedByUsers[];
}
