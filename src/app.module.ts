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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

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
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10)
    }),
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    AppService
  ]
})
export class AppModule {}
