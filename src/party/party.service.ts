import { Injectable } from '@nestjs/common';
import { UuidService } from 'src/auth/uuid.service';
import { AuthService } from 'src/auth/auth.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import {
  CreatePartyInput,
  JoinPartyInput,
  NewParty,
  Party,
  PlayerVoteInput,
  Role,
  UserJoinParty,
} from './models';

@Injectable()
export class PartyService {
  constructor(
    private cacheManager: RedisCacheService,
    private uuidService: UuidService,
    private authService: AuthService,
  ) {}

  async createParty({
    partyName,
    username,
  }: CreatePartyInput): Promise<NewParty> {
    const partyId = this.uuidService.generateV4();
    const user = {
      userId: this.uuidService.generateV4(),
      username,
      role: Role.SCRUMMASTER,
    };
    const newParty: Party = {
      partyId,
      partyName,
      users: [{ ...user, vote: null }],
    };
    const redisResponse = await this.cacheManager.set(
      `party_${partyId}`,
      newParty,
    );

    const { accessToken } = this.authService.login({
      ...user,
      partyId,
    });

    return {
      party: newParty,
      redisResponse,
      accessToken,
    };
  }

  async joinParty({
    partyId,
    username,
  }: JoinPartyInput): Promise<UserJoinParty> {
    const party = await this.cacheManager.get<Party>(`party_${partyId}`);

    if (!party) throw new Error('Party not found');

    const { users } = party;
    const newUser = {
      userId: this.uuidService.generateV4(),
      username,
      role: Role.DEVELOPER,
    };

    users.push({ ...newUser, vote: null });

    const updatedParty = {
      ...party,
      users,
    };
    const redisResponse = await this.cacheManager.set(
      `party_${partyId}`,
      updatedParty,
    );
    const { accessToken } = this.authService.login({
      ...newUser,
      partyId,
    });

    return { party: updatedParty, redisResponse, accessToken };
  }

  async playerVote({ partyToken, vote }: PlayerVoteInput): Promise<Party> {
    const userSession = this.authService.verifySessionToken(partyToken);
    if (!userSession) throw new Error('Invalid session token');

    const { partyId, userId } = userSession;
    const party = await this.cacheManager.get<Party>(`party_${partyId}`);
    const { users } = party;

    const userIndex = users.findIndex((user) => user.userId === userId);

    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].vote = vote;

    const updatedParty = {
      ...party,
      users,
    };

    await this.cacheManager.set(`party_${partyId}`, updatedParty);

    return updatedParty;
  }
}
