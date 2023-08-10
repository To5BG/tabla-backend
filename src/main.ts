import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser(process.env.REFRESH_COOKIE_SECRET));
  app.use(helmet());
  await app.listen(process.env.PORT || 3001);
}

bootstrap();
