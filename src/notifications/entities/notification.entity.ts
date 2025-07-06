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

export enum DecisionStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
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

  @Column({
    type: 'enum',
    enum: DecisionStatus,
    nullable: true,
  })
  decisionStatus: DecisionStatus | null;

  @CreateDateColumn()
  createdAt: Date;
}
