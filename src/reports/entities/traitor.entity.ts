import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TraitorStatus {
  ACTIVE = 'active',
  ELIMINATED = 'eliminated',
}

@Entity('traitors')
export class Traitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  recompensa: string;

  @Column({ type: 'enum', enum: TraitorStatus })
  status: TraitorStatus;

  @Column({ nullable: true })
  eliminatedBy: string;

  @Column({ nullable: true })
  eliminatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
