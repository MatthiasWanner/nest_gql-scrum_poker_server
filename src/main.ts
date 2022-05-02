import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import config from './configuration';

async function bootstrap() {
  const { port } = config();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(port);
  console.log(`NestJS server is running on port ${port}`);
}
bootstrap();
