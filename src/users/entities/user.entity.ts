import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Message } from '../../chat/entities/message.entity';

export enum UserRole {
  KAGE = 'kage',
  AGENTE = 'agente',
  TRAIDOR = 'traidor',
}

@Entity('users')
export class User extends TimestampedEntity {
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
  isActive: boolean;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
