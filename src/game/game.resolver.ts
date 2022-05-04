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
  CreateGameInput,
  JoinGameInput,
  PlayerVoteInput,
  CurrentGame,
  GetGameVotesArgs,
  GameResponse,
} from './models';
import { GameService } from './game.service';
import { GameSubscriptions } from './types/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlGameGuard, GqlRolesGuard } from 'src/auth/guards';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/common/decorators/roles.decorator';
import { accessTokenKey } from 'src/constants';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { ForbiddenError } from 'apollo-server-express';

@Resolver('Game')
export class GameResolver {
  constructor(
    private cacheManager: RedisCacheService,
    private gameService: GameService,
    private configService: ConfigService,
    private redisPubSub: RedisPubSubService,
  ) {}

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

  @Mutation(() => GameResponse)
  async createGame(
    @Context('res') res: Response,
    @Args('input', { nullable: false, type: () => CreateGameInput })
    input: CreateGameInput,
  ): Promise<GameResponse> {
    const { accessToken, ...response } = await this.gameService.createGame(
      input,
    );

    const cookiesConfig = this.configService.get('cookiesConfig');
    res.cookie(accessTokenKey, accessToken, cookiesConfig);
    return response;
  }

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

  @Mutation(() => GameResponse)
  async joinGame(
    @Context('pubsub') pubSub: RedisPubSub,
    @Context('res') res: Response,
    @Args('input', { nullable: false, type: () => JoinGameInput })
    input: JoinGameInput,
  ): Promise<GameResponse> {
    const { accessToken, ...response } = await this.gameService.joinGame(input);

    const cookiesConfig = this.configService.get('cookiesConfig');
    res.cookie(accessTokenKey, accessToken, cookiesConfig);

    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${input.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: response.game,
      },
    );
    return response;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CurrentGame)
  async playerVote(
    @Context('pubsub') pubSub: RedisPubSub,
    @Context('req') { user }: Request,
    @Args('input', { nullable: false, type: () => PlayerVoteInput })
    input: PlayerVoteInput,
  ): Promise<CurrentGame> {
    const updatedGame = await this.gameService.playerVote(input, user);
    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: updatedGame,
      },
    );
    return updatedGame;
  }
}
