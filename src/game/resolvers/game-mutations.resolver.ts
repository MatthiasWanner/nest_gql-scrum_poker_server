import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
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
import { GqlAuthGuard, GqlGameGuard, GqlRolesGuard } from 'src/auth/guards';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { accessTokenKey } from 'src/constants';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { GqlUserInfos } from 'src/common/decorators/gql-user-infos.decorator';
import { UpdateGameArgs } from '../models/UpdateGame';
import { Roles } from 'src/common/decorators/roles.decorator';

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
    @GqlUserInfos() user: UserSession,
    @Args() args: PlayerVoteArgs,
  ): Promise<CurrentGame> {
    const updatedGame = await this.gameService.playerVote(user.userId, args);
    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: updatedGame,
      },
    );
    return updatedGame;
  }

  @Roles('scrumMaster')
  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard)
  @Mutation(() => CurrentGame)
  async updateGame(@Args() args: UpdateGameArgs): Promise<CurrentGame> {
    const updatedGame = await this.gameService.updateGame(args);
    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: updatedGame,
      },
    );
    return updatedGame;
  }
}
