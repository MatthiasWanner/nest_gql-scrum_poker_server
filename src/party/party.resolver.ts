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
import { CreatePartyInput, JoinPartyInput, NewParty, Party } from './models';
import { PartyService } from './party.service';
import { PartySubscriptions } from './types/pub-sub.types';

@Resolver('Party')
export class PartyResolver {
  constructor(
    private cacheManager: RedisCacheService,
    private partyService: PartyService,
  ) {}

  @Subscription(() => Party, { name: PartySubscriptions.PLAYING_PARTY })
  subscribeToPartyCreated(@Context('pubsub') pubSub: RedisPubSub) {
    return pubSub.asyncIterator(PartySubscriptions.PLAYING_PARTY);
  }

  @Mutation(() => Party)
  async createParty(
    @Args('input', { nullable: false, type: () => CreatePartyInput })
    input: CreatePartyInput,
  ): Promise<NewParty> {
    return await this.partyService.createParty(input);
  }

  @Query(() => Party, { nullable: true })
  async getOneParty(
    @Args('id', { nullable: false, type: () => String })
    id: string,
  ): Promise<Party | null> {
    return await this.cacheManager.get<Party | null>(`party_${id}`);
  }

  @Mutation(() => Party)
  async joinParty(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => JoinPartyInput })
    input: JoinPartyInput,
  ): Promise<Party> {
    const updatedParty = await this.partyService.joinParty(input);
    pubSub.publish(PartySubscriptions.PLAYING_PARTY, {
      [PartySubscriptions.PLAYING_PARTY]: updatedParty,
    });
    return updatedParty;
  }
}
