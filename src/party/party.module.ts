import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { PartyResolver } from './party.resolver';
import { PartyService } from './party.service';

@Module({
  imports: [RedisCacheModule, AuthModule],
  providers: [PartyResolver, PartyService],
})
export class PartyModule {}
