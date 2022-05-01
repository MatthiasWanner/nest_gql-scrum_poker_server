import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  imports: [RedisCacheModule, AuthModule, ConfigModule],
  providers: [GameResolver, GameService],
})
export class GameModule {}
