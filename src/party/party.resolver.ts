import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { CreatePartyInput, NewParty, Party } from './models';

@Resolver('Party')
export class PartyResolver {
  constructor(private cacheManager: RedisCacheService) {}

  @Subscription(() => [String], { name: 'partyCreated' })
  subscribeToPartyCreated(@Context('pubsub') pubSub: RedisPubSub) {
    return pubSub.asyncIterator('partyCreated');
  }

  @Mutation(() => Party)
  async createParty(
    @Args('input', { nullable: false, type: () => CreatePartyInput })
    { partyName, username }: CreatePartyInput,
  ): Promise<NewParty> {
    const partyId = '1';
    const newParty: Party = {
      partyId,
      partyName,
      users: [{ userId: '1', username }],
    };
    const redisResponse = await this.cacheManager.set(
      `party_${partyId}`,
      newParty,
    );

    return { ...newParty, redisResponse };
  }

  @Query(() => Party)
  async getOneParty(
    @Args('id', { nullable: false, type: () => String })
    id: string,
  ) {
    return await this.cacheManager.get(`party_${id}`);
  }
}
