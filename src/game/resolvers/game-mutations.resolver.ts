import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
  CreateGameInput,
  JoinGameInput,
  CurrentGame,
  GameResponse,
  PlayerVoteArgs,
} from '../models';
import { GameService } from '../game.service';
import { GameSubscriptions } from '../types/pub-sub.types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlGameGuard } from 'src/auth/guards';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { accessTokenKey } from 'src/constants';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';

@Resolver('Game')
export class GameMutationsResolver {
  constructor(
    private gameService: GameService,
    private configService: ConfigService,
    private redisPubSub: RedisPubSubService,
  ) {}

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

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Mutation(() => CurrentGame)
  async playerVote(
    @Context('req') { user }: Request,
    @Args() args: PlayerVoteArgs,
  ): Promise<CurrentGame> {
    const { input } = args;
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
