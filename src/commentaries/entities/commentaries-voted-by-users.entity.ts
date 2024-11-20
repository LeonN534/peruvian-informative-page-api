import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Votes } from '../enums/votes.enum.';
import { User } from 'src/auth/entities/user.entity';
import { Commentary } from './commentary.entity';

@Entity()
export class CommentariesVotedByUsers {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid')
  public userId: string;

  @Column('int')
  public commentaryId: number;

  @Column({
    type: 'enum',
    enum: Votes,
    nullable: false,
  })
  public vote: Votes;

  @ManyToOne(() => User, (user) => user.commentariesVotedByUsers)
  public user: User;

  @ManyToOne(
    () => Commentary,
    (commentary) => commentary.commentariesVotedByUsers,
  )
  public commentary: Commentary;
}
