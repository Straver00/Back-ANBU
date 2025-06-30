import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  MISSION = 'mission',
  DECISION = 'decision',
  INFO = 'info',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  decisionStatus: 'accepted' | 'rejected' | null;

  @CreateDateColumn()
  createdAt: Date;
}
