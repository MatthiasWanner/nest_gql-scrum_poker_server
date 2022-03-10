import { Injectable } from '@nestjs/common';
import { UuidService } from 'src/auth/uuid.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { CreatePartyInput, JoinPartyInput, Party } from './models';

@Injectable()
export class PartyService {
  constructor(
    private cacheManager: RedisCacheService,
    private uuidService: UuidService,
  ) {}

  async createParty({ partyName, username }: CreatePartyInput) {
    const partyId = this.uuidService.generateV4();
    const newParty: Party = {
      partyId,
      partyName,
      users: [{ userId: this.uuidService.generateV4(), username, vote: null }],
    };
    const redisResponse = await this.cacheManager.set(
      `party_${partyId}`,
      newParty,
    );

    return { ...newParty, redisResponse };
  }

  async joinParty({ partyId, username }: JoinPartyInput) {
    const party = await this.cacheManager.get<Party>(`party_${partyId}`);

    if (!party) throw new Error('Party not found');

    const { users } = party;
    users.push({ userId: this.uuidService.generateV4(), username, vote: null });

    const updatedParty = {
      ...party,
      users,
    };
    await this.cacheManager.set(`party_${partyId}`, updatedParty);

    return updatedParty;
  }
}
