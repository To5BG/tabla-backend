import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credentials } from 'src/entities/credentials.entity';
import { UsersModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

/**
 * Authentication module
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true
    }),
    TypeOrmModule.forFeature([Credentials]),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    AuthService
  ]
})
export class AuthModule {}
