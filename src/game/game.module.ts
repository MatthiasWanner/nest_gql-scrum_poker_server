import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis-cache/redis.module';
import GameResolvers from './resolvers';
import { GameService } from './game.service';

@Module({
  imports: [RedisModule, AuthModule, ConfigModule],
  providers: [GameService, ...GameResolvers],
})
export class GameModule {}
