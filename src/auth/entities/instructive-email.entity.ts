import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class InstructiveEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column({ type: 'int', default: 0 })
  emailSendCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSentTime: Date;

  @Column({ type: 'text' })
  token: string;

  @Column()
  tokenExpiration: Date;

  @BeforeInsert()
  setInitialValues() {
    this.emailSendCount = 1;
    this.lastSentTime = new Date();
  }
}
