import { Module } from '@nestjs/common';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { PartyResolver } from './party.resolver';
import { PartyService } from './party.service';

@Module({
  imports: [RedisCacheModule],
  providers: [PartyResolver, PartyService],
})
export class PartyModule {}
