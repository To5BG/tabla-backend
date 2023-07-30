import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import ormConfig from 'ormconfig';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

/**
 * Main App module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ormConfig]
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10)
          },
          password: process.env.REDIS_PASSWORD,
          ttl: parseInt(process.env.JWT_REFRESH_TIME ?? '3600', 10) * 1000
        })
      })
    }),
    TypeOrmModule.forRoot(ormConfig() as TypeOrmModuleOptions),
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
