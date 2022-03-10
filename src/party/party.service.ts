import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { CreatePartyInput, JoinPartyInput, Party } from './models';

@Injectable()
export class PartyService {
  constructor(private cacheManager: RedisCacheService) {}

  async createParty({ partyName, username }: CreatePartyInput) {
    const partyId = '1';
    const newParty: Party = {
      partyId,
      partyName,
      users: [{ userId: '1', username, vote: null }],
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
    const newUserId = `${users.length + 1}`;
    users.push({ userId: newUserId, username, vote: null });

    const updatedParty = {
      ...party,
      users,
    };
    await this.cacheManager.set(`party_${partyId}`, updatedParty);

    return updatedParty;
  }
}
