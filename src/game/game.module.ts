import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis-cache/redis.module';
import GameResolvers from './resolvers';
import { GameService } from './game.service';

@Module({
  imports: [RedisModule, AuthModule, ConfigModule],
  providers: [GameService, ...GameResolvers],
})
export class GameModule {}
