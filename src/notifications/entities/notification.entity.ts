import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { NotificationType } from '../enum/notification-type.enum';
import { DecisionStatus } from '../enum/decision-status.enum';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';

@Entity('notifications')
export class Notification extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('text', { name: 'message' })
  message: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('uuid', { name: 'context_id', nullable: true })
  contextId: string | null;

  @Column('boolean', {
    name: 'is_read',
    default: false,
  })
  isRead: boolean;

  @Column({
    name: 'decision_status',
    type: 'enum',
    enum: DecisionStatus,
    nullable: true,
  })
  decisionStatus: DecisionStatus | null;
}
