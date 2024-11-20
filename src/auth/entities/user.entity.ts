import {
  Column,
  CreateDateColumn,
  Entity,
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
}
