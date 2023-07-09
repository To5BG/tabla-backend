import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogInfo } from 'src/entities/loginfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogInfo])],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
