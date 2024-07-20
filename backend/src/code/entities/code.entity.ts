import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  language: string;

  @Column()
  @Column({ nullable: true })
  author?: string;

  @Exclude()
  @Column({ nullable: true })
  viewPassword?: string;

  @Exclude()
  @Column({ nullable: true })
  editPassword?: string;

  @Column({ type: 'timestamp' })
  timeAdded: Date;

  // Specially for cron
  @Column({
    name: 'timetodeleate',
    type: 'timestamp',
  })
  timeExpired: Date;
}
