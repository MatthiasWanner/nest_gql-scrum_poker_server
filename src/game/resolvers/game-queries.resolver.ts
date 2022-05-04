import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { CurrentGame, GetGameVotesArgs } from '../models';
import { GameService } from '../game.service';
import { GameSubscriptions } from '../types/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlGameGuard, GqlRolesGuard } from 'src/auth/guards';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { ForbiddenError } from 'apollo-server-express';

@Resolver('Game')
export class GameQueriesResolver {
  constructor(
    private cacheManager: RedisCacheService,
    private gameService: GameService,
    private redisPubSub: RedisPubSubService,
  ) {}

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Query(() => CurrentGame, { nullable: true })
  async getOneGame(
    @Args('id', { nullable: false, type: () => String })
    id: string,
  ): Promise<CurrentGame | null> {
    const game = await this.cacheManager.get<CurrentGame>(`game_${id}`);

    if (game) return this.gameService.hidePlayersVotes(game);

    return null;
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard)
  @Roles('scrumMaster')
  @Query(() => CurrentGame, { nullable: true })
  async getGameVotes(
    @Context('pubsub') pubSub: RedisPubSub,
    @Context('req') { user }: Request,
    @Args() args: GetGameVotesArgs,
  ): Promise<CurrentGame | null> {
    const { id } = args;
    const { gameId } = user;

    if (id === gameId) {
      const game = await this.cacheManager.get<CurrentGame>(`game_${id}`);

      if (!game.users.every((user) => user.vote !== null)) {
        throw new ForbiddenError(
          'All players must have voted to reveal the result',
        );
      }

      this.redisPubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${id}`, {
        [GameSubscriptions.PLAYING_GAME]: game,
      });

      return game;
    }

    throw new ForbiddenError('You are not allowed to see this ressource');
  }
}
