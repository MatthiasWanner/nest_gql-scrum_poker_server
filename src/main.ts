import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { appConfiguration } from './configurations';

async function bootstrap() {
  const { port, corsOrigin } = appConfiguration();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: corsOrigin,
    methods: 'GET,HEAD,POST',
    allowedHeaders: 'Content-Type, Accept',
  });
  app.use(cookieParser());
  await app.listen(port);
  console.log(`NestJS server is running on port ${port}`);
}
bootstrap();
