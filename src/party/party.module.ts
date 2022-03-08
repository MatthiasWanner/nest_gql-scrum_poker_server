import { Module } from '@nestjs/common';
import { PartyResolver } from './party.resolver';
import { PartyService } from './party.service';

@Module({
  providers: [PartyResolver, PartyService],
})
export class PartyModule {}
