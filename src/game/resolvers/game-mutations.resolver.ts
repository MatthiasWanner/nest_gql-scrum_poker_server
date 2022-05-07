import { Args, Context, ID, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateGameInput,
  CurrentGame,
  GameResponse,
  PlayerVoteArgs,
  JoinGameArgs,
  DeleteUsersEvent,
  GameChangeNameEvent,
  GameEvent,
  GameStatusEvent,
  GameSubscriptions,
  GameVoteEvent,
  JoinGameEvent,
  LeftGameEvent,
  UpdateGameArgs,
  GameResetEvent,
} from '../models';
import { GameService } from '../game.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlRolesGuard } from 'src/auth/guards';
import { GqlDeleteUserGuard, GqlGameGuard, GqlGameVoteGuard } from '../guards';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { accessTokenKey } from 'src/constants';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { GqlUserInfos } from 'src/common/decorators/gql-user-infos.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Message } from 'src/models/app.models';
import { UserRole } from 'src/user/models';

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
    @Args() args: JoinGameArgs,
  ): Promise<GameResponse> {
    const { accessToken, ...response } = await this.gameService.joinGame(args);

    const cookiesConfig = this.configService.get('cookiesConfig');
    res.cookie(accessTokenKey, accessToken, cookiesConfig);

    const events: JoinGameEvent[] = [
      { eventType: GameEvent.USERJOINGAME, payload: response.user },
    ];

    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${args.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return response;
  }

  @UseGuards(GqlAuthGuard, GqlGameGuard, GqlGameVoteGuard)
  @Mutation(() => CurrentGame)
  async playerVote(
    @GqlUserInfos() user: UserSession,
    @Args() args: PlayerVoteArgs,
  ): Promise<CurrentGame> {
    const updatedGame = await this.gameService.playerVote(user.userId, args);

    const events: GameVoteEvent[] = [
      { eventType: GameEvent.USERVOTE, payload: user.userId },
    ];

    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return updatedGame;
  }

  @Roles('scrumMaster')
  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard, GqlDeleteUserGuard)
  @Mutation(() => CurrentGame)
  async updateGame(@Args() args: UpdateGameArgs): Promise<CurrentGame> {
    const updatedGame = await this.gameService.updateGame(args);
    const events = [];

    args.input.gameName &&
      events.push({
        eventType: GameEvent.GAMENAMECHANGED,
        payload: updatedGame.gameName,
      } as GameChangeNameEvent);

    args.input.status &&
      events.push({
        eventType: GameEvent.STATUSCHANGED,
        payload: updatedGame.status,
      } as GameStatusEvent);

    args.input.deleteUsers &&
      events.push({
        eventType: GameEvent.USERSDELETED,
        payload: args.input.deleteUsers,
      } as DeleteUsersEvent);

    args.input.resetVotes &&
      events.push({
        eventType: GameEvent.RESETVOTES,
        payload: null,
      } as GameResetEvent);

    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return updatedGame;
  }

  @UseGuards(GqlAuthGuard, GqlGameGuard)
  @Mutation(() => Message)
  async quitGame(
    @Context('res') res: Response,
    @GqlUserInfos() user: UserSession,
    @Args('gameId', { type: () => ID }) gameId: string,
  ): Promise<Message> {
    const updatedGame = await this.gameService.quitGame(gameId, user);
    res.clearCookie(accessTokenKey);

    const events: LeftGameEvent[] = [
      { eventType: GameEvent.USERLEFTGAME, payload: user.userId },
    ];

    user.role === UserRole.SCRUMMASTER &&
      events.push({
        eventType: GameEvent.STATUSCHANGED,
        payload: updatedGame.status,
      } as GameStatusEvent);

    this.redisPubSub.publish(
      `${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return { message: `Player ${user.username} left the game` };
  }
}
