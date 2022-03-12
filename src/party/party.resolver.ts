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
import {
  CreatePartyInput,
  JoinPartyInput,
  NewParty,
  Party,
  PlayerVoteInput,
  UserJoinParty,
} from './models';
import { PartyService } from './party.service';
import { PartySubscriptions } from './types/pub-sub.types';

@Resolver('Party')
export class PartyResolver {
  constructor(
    private cacheManager: RedisCacheService,
    private partyService: PartyService,
  ) {}

  @Subscription(() => Party, {
    name: PartySubscriptions.PLAYING_PARTY,
  })
  subscribeToPartyCreated(
    @Args('partyId', { nullable: false, type: () => String }) partyId: string,
    @Context('pubsub')
    pubSub: RedisPubSub,
  ) {
    return pubSub.asyncIterator(
      `${PartySubscriptions.PLAYING_PARTY}_${partyId}`,
    );
  }

  @Mutation(() => NewParty)
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
    return await this.cacheManager.get<Party>(`party_${id}`);
  }

  @Mutation(() => UserJoinParty)
  async joinParty(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => JoinPartyInput })
    input: JoinPartyInput,
  ): Promise<UserJoinParty> {
    const response = await this.partyService.joinParty(input);
    pubSub.publish(`${PartySubscriptions.PLAYING_PARTY}_${input.partyId}`, {
      [PartySubscriptions.PLAYING_PARTY]: response.party,
    });
    return response;
  }

  @Mutation(() => Party)
  async playerVote(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => PlayerVoteInput })
    input: PlayerVoteInput,
  ): Promise<Party> {
    const updatedParty = await this.partyService.playerVote(input);
    pubSub.publish(
      `${PartySubscriptions.PLAYING_PARTY}_${updatedParty.partyId}`,
      {
        [PartySubscriptions.PLAYING_PARTY]: updatedParty,
      },
    );
    return updatedParty;
  }
}
