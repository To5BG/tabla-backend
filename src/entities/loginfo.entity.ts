import { BeforeInsert, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('loginfo_table')
export class LogInfo {
  @PrimaryColumn()
  user_id: string;

  @OneToOne(() => User, { cascade: true })
  user: User;

  @BeforeInsert()
  setId() {
    this.user_id = this.user.id;
  }

  @Column({ type: 'varchar', length: 64 })
  password: string;

  @Column({ type: 'varchar', length: 64 })
  email: string;
}
