import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentGame } from '../models';
import { GameSubscriptions } from '../types/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlGameGuard } from 'src/auth/guards';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';

@Resolver('Game')
export class GameSubscriptionsResolver {
  constructor(private redisPubSub: RedisPubSubService) {}

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Subscription(() => CurrentGame, {
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
