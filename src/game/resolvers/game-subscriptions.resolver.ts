import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { GameEventResponse, GameSubscriptions } from '../models';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@auth/guards';
import { GqlGameGuard } from '../guards';
import { RedisPubSubService } from '@redis-cache/redis-pubsub.service';

@Resolver()
export class GameSubscriptionsResolver {
  constructor(private redisPubSub: RedisPubSubService) {}

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Subscription(() => [GameEventResponse], {
    name: GameSubscriptions.PLAYING_GAME,
  })
  subscribeToGameCreated(
    @Args('gameId', { nullable: false, type: () => String }) gameId: string,
  ) {
    return this.redisPubSub.subscribe(
      `${GameSubscriptions.PLAYING_GAME}_${gameId}`,
    );
  }
}
