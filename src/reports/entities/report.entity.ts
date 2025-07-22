import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReportType } from '../enum/reportType.enum';
import { ReportState } from '../enum/reportState.enum';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'traidor_id' })
  traidorId: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'traidor_id' })
  traidor: User;

  @Column({
    name: 'type_report',
    type: 'enum',
    enum: ReportType,
  })
  typeReport: ReportType;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: ReportState,
    default: ReportState.EN_PROCESO,
  })
  state: ReportState;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
