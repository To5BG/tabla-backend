import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig() as TypeOrmModuleOptions),
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
