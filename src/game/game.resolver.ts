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
import { AuthService } from 'src/auth/auth.service';
import {
  CreateGameInput,
  JoinGameInput,
  NewGame,
  PlayerVoteInput,
  UserJoinGame,
  CurrentGame,
  GetGameVotesArgs,
} from './models';
import { GameService } from './game.service';
import { GameSubscriptions } from './types/pub-sub.types';
import { Role } from 'src/user/models';

@Resolver('Game')
export class GameResolver {
  constructor(
    private cacheManager: RedisCacheService,
    private gameService: GameService,
    private autService: AuthService,
  ) {}

  @Subscription(() => CurrentGame, {
    name: GameSubscriptions.PLAYING_GAME,
  })
  subscribeToGameCreated(
    @Args('gameId', { nullable: false, type: () => String }) gameId: string,
    @Context('pubsub')
    pubSub: RedisPubSub,
  ) {
    return pubSub.asyncIterator(`${GameSubscriptions.PLAYING_GAME}_${gameId}`);
  }

  @Mutation(() => NewGame)
  async createGame(
    @Args('input', { nullable: false, type: () => CreateGameInput })
    input: CreateGameInput,
  ): Promise<NewGame> {
    return await this.gameService.createGame(input);
  }

  @Query(() => CurrentGame, { nullable: true })
  async getOneGame(
    @Args('id', { nullable: false, type: () => String })
    id: string,
  ): Promise<CurrentGame | null> {
    const game = await this.cacheManager.get<CurrentGame>(`game_${id}`);

    if (game) return this.gameService.hidePlayersVotes(game);

    return null;
  }

  @Query(() => CurrentGame, { nullable: true })
  async getGameVotes(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args() args: GetGameVotesArgs,
  ): Promise<CurrentGame | null> {
    const { accessToken, id } = args;
    const { role, gameId } = this.autService.verifySessionToken(accessToken);

    if (role === Role.SCRUMMASTER && id === gameId) {
      const game = await this.cacheManager.get<CurrentGame>(`game_${id}`);

      if (!game.users.every((user) => user.vote !== null)) {
        throw new Error('All players must have voted to reveal the result');
      }

      pubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${id}`, {
        [GameSubscriptions.PLAYING_GAME]: game,
      });

      return game;
    }

    throw new Error('You are not allowed to see this ressource');
  }

  @Mutation(() => UserJoinGame)
  async joinGame(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => JoinGameInput })
    input: JoinGameInput,
  ): Promise<UserJoinGame> {
    const response = await this.gameService.joinGame(input);
    pubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${input.gameId}`, {
      [GameSubscriptions.PLAYING_GAME]: response.game,
    });
    return response;
  }

  @Mutation(() => CurrentGame)
  async playerVote(
    @Context('pubsub') pubSub: RedisPubSub,
    @Args('input', { nullable: false, type: () => PlayerVoteInput })
    input: PlayerVoteInput,
  ): Promise<CurrentGame> {
    const updatedGame = await this.gameService.playerVote(input);
    pubSub.publish(`${GameSubscriptions.PLAYING_GAME}_${updatedGame.gameId}`, {
      [GameSubscriptions.PLAYING_GAME]: updatedGame,
    });
    return updatedGame;
  }
}
