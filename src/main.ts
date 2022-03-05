import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './configuration';

async function bootstrap() {
  const port = config().port;
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
bootstrap();
