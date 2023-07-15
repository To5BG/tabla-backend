import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import ormConfig from 'ormconfig';

/**
 *
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ormConfig]
    }),
    TypeOrmModule.forRoot(ormConfig() as TypeOrmModuleOptions),
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
