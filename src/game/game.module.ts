import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  imports: [RedisCacheModule, AuthModule],
  providers: [GameResolver, GameService],
})
export class GameModule {}
