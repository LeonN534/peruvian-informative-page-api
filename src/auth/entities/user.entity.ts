import { Commentary } from 'src/commentaries/entities/commentary.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text', { default: 'Nuevo Usuario' })
  fullName?: string;

  @Column('text', { nullable: true })
  photoUrl?: string;

  @CreateDateColumn()
  creationDate: Date;

  @OneToMany(() => Commentary, (commentary) => commentary.user)
  commentaries: Commentary[];
}
