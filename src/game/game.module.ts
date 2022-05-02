import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis-cache/redis.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  imports: [RedisModule, AuthModule, ConfigModule],
  providers: [GameResolver, GameService],
})
export class GameModule {}
