import { Args, Query, Resolver } from '@nestjs/graphql';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { CurrentGame, GetGameArgs } from '../models';
import { GameService } from '../game.service';
import { GameSubscriptions } from '../types/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlGameGuard, GqlRolesGuard } from 'src/auth/guards';
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
  async getOneGame(@Args() args: GetGameArgs): Promise<CurrentGame | null> {
    const game = await this.cacheManager.get<CurrentGame>(
      `game_${args.gameId}`,
    );

    if (game) return this.gameService.hidePlayersVotes(game);

    return null;
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard)
  @Roles('scrumMaster')
  @Query(() => CurrentGame, { nullable: true })
  async getGameVotes(@Args() args: GetGameArgs): Promise<CurrentGame | null> {
    const { gameId } = args;
    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);

    if (!game.users.every((user) => user.vote !== null)) {
      throw new ForbiddenError(
        'All players must have voted to reveal the result',
      );
    }

    this.redisPubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${gameId}`, {
      [GameSubscriptions.PLAYING_GAME]: game,
    });

    return game;
  }
}
