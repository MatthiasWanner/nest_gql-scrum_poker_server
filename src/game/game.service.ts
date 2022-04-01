import { Injectable } from '@nestjs/common';
import { UuidService } from 'src/auth/uuid.service';
import { AuthService } from 'src/auth/auth.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import {
  CreateGameInput,
  JoinGameInput,
  NewGame,
  PlayerVoteInput,
  UserJoinGame,
  CurrentGame,
  Status,
} from './models';
import { Role } from 'src/user/models';

@Injectable()
export class GameService {
  constructor(
    private cacheManager: RedisCacheService,
    private uuidService: UuidService,
    private authService: AuthService,
  ) {}

  async createGame({ gameName, username }: CreateGameInput): Promise<NewGame> {
    const gameId = this.uuidService.generateV4();
    const user = {
      userId: this.uuidService.generateV4(),
      username,
      role: Role.SCRUMMASTER,
    };
    const newGame: CurrentGame = {
      gameId,
      gameName,
      users: [{ ...user, vote: null, hasVoted: false }],
      isShowable: false,
      status: Status.WAITING,
    };
    const redisResponse = await this.cacheManager.set(
      `game_${gameId}`,
      newGame,
    );

    const { accessToken } = this.authService.login({
      ...user,
      gameId,
    });

    return {
      game: newGame,
      redisResponse,
      accessToken,
    };
  }

  async joinGame({ gameId, username }: JoinGameInput): Promise<UserJoinGame> {
    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);

    if (!game) throw new Error('Game not found');

    const { users } = game;
    const newUser = {
      userId: this.uuidService.generateV4(),
      username,
      role: Role.DEVELOPER,
    };

    users.push({ ...newUser, vote: null, hasVoted: false });

    const updatedGame = {
      ...game,
      users,
    };
    const redisResponse = await this.cacheManager.set(
      `game_${gameId}`,
      updatedGame,
    );
    const { accessToken } = this.authService.login({
      ...newUser,
      gameId,
    });

    return { game: updatedGame, redisResponse, accessToken };
  }

  async playerVote({ gameToken, vote }: PlayerVoteInput): Promise<CurrentGame> {
    const userSession = this.authService.verifySessionToken(gameToken);
    if (!userSession) throw new Error('Invalid session token');

    const { gameId, userId } = userSession;
    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);
    const { users } = game;

    const userIndex = users.findIndex((user) => user.userId === userId);

    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].vote = vote;
    users[userIndex].hasVoted = true;

    const updatedGame = {
      ...game,
      users,
    };

    await this.cacheManager.set(`game_${gameId}`, updatedGame);

    return this.hidePlayersVotes(updatedGame);
  }

  hidePlayersVotes(game: CurrentGame): CurrentGame {
    const { users } = game;
    const updatedUsers = users.map((user) => ({
      ...user,
      vote: null,
    }));

    return {
      ...game,
      users: updatedUsers,
    };
  }
}
