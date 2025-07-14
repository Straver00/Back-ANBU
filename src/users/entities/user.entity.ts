import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  //OneToMany,
} from 'typeorm';
import { UserRole } from '../enum/userRole.enum';
import { Exclude } from 'class-transformer';
import { Message } from '../../chat/entities/message.entity';
// import { Message } from '../../chat/entities/message.entity';

@Entity('users')
@Unique(['email'])
@Unique(['alias'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ name: 'alias', type: 'varchar', length: 100 })
  alias: string;

  @Column({ name: 'email', type: 'varchar', length: 50 })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 60, select: false })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENTE })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
