import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MissionParticipation } from './missionParticipation.entity';
//import { Message } from '../../chat/entities/message.entity';
import { MissionPriority } from '../enum/missionPriority.enum';
import { MissionStatus } from '../enum/missionStatus.enum';
import { Message } from '../../chat/entities/message.entity';

@Entity('regular_missions')
export class RegularMission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code_name', length: 255 })
  codeName: string;

  @Column({ length: 255 })
  objective: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'captain_id' })
  captain: User;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: MissionPriority,
    default: MissionPriority.BAJA,
  })
  priority: MissionPriority;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.EN_PROCESO,
  })
  status: MissionStatus;

  // Usar la tabla mission_participation en lugar de JoinTable automático
  @OneToMany(
    () => MissionParticipation,
    (participation) => participation.mission,
    { eager: true },
  )
  participations: MissionParticipation[];

  // Propiedad virtual para acceder a los agentes asignados
  get assignedAgents(): User[] {
    return this.participations?.map((p) => p.user) || [];
  }

  // Relación con mensajes (descomenta si la usas)
  @OneToMany(() => Message, (message) => message.mission)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
