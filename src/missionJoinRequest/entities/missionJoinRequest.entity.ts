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
import { RegularMission } from '../../regularMissions/entities/regularMission.entity';
import { RequestStatus } from '../enum/requestStatus.enum';
import { RequestType } from '../enum/requestType.enum';

@Entity('mission_join_requests')
export class MissionJoinRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RegularMission, { nullable: false })
  @JoinColumn({ name: 'mission_id' })
  mission: RegularMission;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @Column({
    name: 'request_by',
    type: 'enum',
    enum: RequestType,
    nullable: false,
  })
  requestBy: RequestType;

  @Column({
    name: 'is_reinforcement',
    type: 'boolean',
    default: false,
  })
  isReinforcement: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDIENTE,
  })
  status: RequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
