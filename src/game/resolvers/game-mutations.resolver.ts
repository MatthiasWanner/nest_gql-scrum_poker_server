import { Args, Context, ID, Mutation, Resolver } from '@nestjs/graphql';
import * as models from '../models';
import { GameService } from '../game.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlRolesGuard } from 'src/auth/guards';
import { GqlDeleteUserGuard, GqlGameGuard, GqlGameVoteGuard } from '../guards';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { accessTokenKey } from 'src/constants';
import { RedisPubSubService } from 'src/redis-cache/redis-pubsub.service';
import { GqlUserInfos, Roles } from 'src/common/decorators';
import { Message } from 'src/models/app.models';
import { UserRole } from 'src/user/models';

@Resolver('Game')
export class GameMutationsResolver {
  constructor(
    private gameService: GameService,
    private configService: ConfigService,
    private redisPubSub: RedisPubSubService,
  ) {}

  @Mutation(() => models.GameResponse)
  async createGame(
    @Context('res') res: Response,
    @Args('input', { nullable: false, type: () => models.CreateGameInput })
    input: models.CreateGameInput,
  ): Promise<models.GameResponse> {
    const { accessToken, ...response } = await this.gameService.createGame(
      input,
    );

    const cookiesConfig = this.configService.get('cookiesConfig');
    res.cookie(accessTokenKey, accessToken, cookiesConfig);
    return response;
  }

  @Mutation(() => models.GameResponse)
  async joinGame(
    @Context('res') res: Response,
    @Args() args: models.JoinGameArgs,
  ): Promise<models.GameResponse> {
    const { accessToken, ...response } = await this.gameService.joinGame(args);

    const cookiesConfig = this.configService.get('cookiesConfig');
    res.cookie(accessTokenKey, accessToken, cookiesConfig);

    const events: models.JoinGameEvent[] = [
      { eventType: models.GameEvent.USERJOINGAME, payload: response.user },
    ];

    this.redisPubSub.publish(
      `${models.GameSubscriptions.PLAYING_GAME}_${args.gameId}`,
      {
        [models.GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return response;
  }

  @UseGuards(GqlAuthGuard, GqlGameGuard, GqlGameVoteGuard)
  @Mutation(() => models.CurrentGame)
  async playerVote(
    @GqlUserInfos() user: UserSession,
    @Args() args: models.PlayerVoteArgs,
  ): Promise<models.CurrentGame> {
    const updatedGame = await this.gameService.playerVote(user.userId, args);

    const events: models.GameVoteEvent[] = [
      { eventType: models.GameEvent.USERVOTE, payload: user.userId },
    ];

    this.redisPubSub.publish(
      `${models.GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [models.GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return updatedGame;
  }

  @Roles('scrumMaster')
  @UseGuards(GqlAuthGuard, GqlRolesGuard, GqlGameGuard, GqlDeleteUserGuard)
  @Mutation(() => models.CurrentGame)
  async updateGame(
    @Args() args: models.UpdateGameArgs,
  ): Promise<models.CurrentGame> {
    const updatedGame = await this.gameService.updateGame(args);
    const events = [];

    args.input.gameName &&
      events.push({
        eventType: models.GameEvent.GAMENAMECHANGED,
        payload: updatedGame.gameName,
      } as models.GameChangeNameEvent);

    args.input.status &&
      events.push({
        eventType: models.GameEvent.STATUSCHANGED,
        payload: updatedGame.status,
      } as models.GameStatusEvent);

    args.input.deleteUsers &&
      events.push({
        eventType: models.GameEvent.USERSDELETED,
        payload: args.input.deleteUsers,
      } as models.DeleteUsersEvent);

    args.input.resetVotes &&
      events.push({
        eventType: models.GameEvent.RESETVOTES,
        payload: null,
      } as models.GameResetEvent);

    this.redisPubSub.publish(
      `${models.GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [models.GameSubscriptions.PLAYING_GAME]: events,
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

    const events: models.LeftGameEvent[] = [
      { eventType: models.GameEvent.USERLEFTGAME, payload: user.userId },
    ];

    user.role === UserRole.SCRUMMASTER &&
      events.push({
        eventType: models.GameEvent.STATUSCHANGED,
        payload: updatedGame.status,
      } as models.GameStatusEvent);

    this.redisPubSub.publish(
      `${models.GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`,
      {
        [models.GameSubscriptions.PLAYING_GAME]: events,
      },
    );
    return { message: `Player ${user.username} left the game` };
  }
}
