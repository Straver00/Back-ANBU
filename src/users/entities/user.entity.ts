import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  KAGE = 'kage',
  AGENTE = 'agente',
  TRAIDOR = 'traidor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column()
  alias: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  active: boolean;
}
