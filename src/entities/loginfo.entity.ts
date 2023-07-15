import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Sensitive user information pertinent to authentication
 */
@Entity('loginfo_table')
export class LogInfo {
  @PrimaryColumn()
  user_id: string;

  @Column({ type: 'varchar', length: 64 })
  password: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;
}
