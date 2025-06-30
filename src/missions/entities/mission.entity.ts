import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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
export class Mission {
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
