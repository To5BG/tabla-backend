import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogInfo } from 'src/entities/loginfo.entity';
import { UsersModule } from 'src/user/user.module';

/**
 * Authentication module
 */
@Module({
  imports: [TypeOrmModule.forFeature([LogInfo]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
