import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  s3: string;

  @Column()
  language: string;

  @Column()
  shortid: string;

  @Column()
  author: string;

  @Exclude()
  @Column({ nullable: true })
  viewPassword?: string;

  @Exclude()
  @Column({ nullable: true })
  editPassword?: string;

  @Column({ type: 'timestamp' })
  timeAdded: Date;

  // Specially for cron if we want to delete the code after a certain time
  @Column({
    name: 'timetodeleate',
    type: 'timestamp',
  })
  timeExpired: Date;
}
