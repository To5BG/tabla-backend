import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Sensitive user information pertinent to authentication
 */
@Entity('credentials_table')
export class Credentials {
  @PrimaryColumn()
  user_id: string;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  password: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  passwordUpdatedAt: Date;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;
}
