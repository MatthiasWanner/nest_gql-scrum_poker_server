import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentGame, GetGameArgs } from '../models';
import { GameService } from '../game.service';
import {
  GameEvent,
  GameRevealVoteEvent,
  GameSubscriptions,
} from '../models/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlRolesGuard } from 'src/auth/guards';
import { GqlGameGuard } from '../guards';
import { Roles } from 'src/common/decorators';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { ForbiddenError } from 'apollo-server-express';

@Resolver('Game')
export class GameQueriesResolver {
  constructor(
    private gameService: GameService,
    private redisPubSub: RedisPubSubService,
  ) {}

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Query(() => CurrentGame, { nullable: true })
  async getOneGame(@Args() args: GetGameArgs): Promise<CurrentGame | null> {
    const game = await this.gameService.getGame(args.gameId);

    if (game) return this.gameService.hidePlayersVotes(game);

    return null;
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard)
  @Roles('scrumMaster')
  @Query(() => CurrentGame, { nullable: true })
  async getGameVotes(@Args() args: GetGameArgs): Promise<CurrentGame | null> {
    const { gameId } = args;
    const game = await this.gameService.getGame(gameId);

    if (!game.users.every((user) => user.vote !== null)) {
      throw new ForbiddenError(
        'All players must have voted to reveal the result',
      );
    }

    const events: GameRevealVoteEvent[] = [
      {
        eventType: GameEvent.REVEALVOTES,
        payload: game.users.map(({ userId, vote }) => ({ userId, vote })),
      },
    ];

    this.redisPubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${gameId}`, {
      [GameSubscriptions.PLAYING_GAME]: events,
    });

    return game;
  }
}
