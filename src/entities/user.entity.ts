import { PrimaryGeneratedColumn, Column, CreateDateColumn, Entity } from 'typeorm';

/**
 * Indicator for user status
 */
export enum Status {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  DDISTURB = 'do-not-disturb'
}

/**
 * Main user information
 */
@Entity('users_table')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  username: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastLoggedIn: Date;

  @Column({ type: 'enum', enum: Status, default: Status.OFFLINE })
  status: Status;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAccountAt: Date;
}
