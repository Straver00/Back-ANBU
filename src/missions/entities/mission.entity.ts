import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../chat/entities/message.entity';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';

export enum MissionLevel {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  CRITICA = 'Crítica',
}

export enum MissionStatus {
  EN_PROCESO = 'En Proceso',
  RETRASO = 'Retraso',
  FRACASO = 'Fracaso',
  COMPLETADA = 'Completada',
}

@Entity('missions')
export class Mission extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  captain: string;

  @Column()
  objective: string;

  @Column()
  deadline: Date;

  @Column({ type: 'enum', enum: MissionLevel })
  level: MissionLevel;

  @Column({ type: 'enum', enum: MissionStatus })
  status: MissionStatus;

  @Column()
  isOwner: boolean;

  @ManyToMany(() => User)
  @JoinTable()
  assignedAgents: User[];

  // @OneToMany(() => Message, (message) => message.user)
  // messages: Message[];
}
