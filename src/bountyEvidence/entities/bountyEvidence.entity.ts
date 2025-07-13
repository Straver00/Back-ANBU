import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BountyMission } from '../../bountyMissions/entities/bountyMission.entity';

@Entity('bounty_evidence')
export class BountyEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'bounty_mission_id' })
  bountyMissionId: string;

  @ManyToOne(() => BountyMission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bounty_mission_id' })
  bountyMission: BountyMission;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
