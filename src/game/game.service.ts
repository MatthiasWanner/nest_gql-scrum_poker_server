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
import { User, UserInGame, UserRole } from 'src/user/models';
import { UserInputError } from 'apollo-server-express';

@Injectable()
export class GameService {
  constructor(
    private cacheManager: RedisCacheService,
    private uuidService: UuidService,
    private authService: AuthService,
  ) {}

  async createGame({ gameName, username }: CreateGameInput): Promise<NewGame> {
    const gameId = this.uuidService.generateV4();

    const userPayload: User = {
      userId: this.uuidService.generateV4(),
      username,
      role: UserRole.SCRUMMASTER,
    };

    const userInGamePayload: UserInGame = {
      ...userPayload,
      vote: null,
      hasVoted: false,
    };

    const newGame: CurrentGame = {
      gameId,
      gameName,
      users: [userInGamePayload],
      status: Status.WAITING,
    };

    const redisResponse = await this.cacheManager.set(
      `game_${gameId}`,
      newGame,
    );

    const { accessToken } = this.authService.login({
      ...userPayload,
      gameId,
    });

    return {
      user: userInGamePayload,
      game: newGame,
      redisResponse,
      accessToken,
    };
  }

  async joinGame({ gameId, username }: JoinGameInput): Promise<UserJoinGame> {
    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);

    if (!game) throw new UserInputError('Game not found');

    const { users } = game;

    const newUser: User = {
      userId: this.uuidService.generateV4(),
      username,
      role: UserRole.DEVELOPER,
    };

    const newUserInGame: UserInGame = {
      ...newUser,
      vote: null,
      hasVoted: false,
    };

    users.push(newUserInGame);

    const updatedGame: CurrentGame = {
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

    return {
      user: newUserInGame,
      game: updatedGame,
      redisResponse,
      accessToken,
    };
  }

  async playerVote(
    { vote }: PlayerVoteInput,
    user: UserSession,
  ): Promise<CurrentGame> {
    const { gameId, userId } = user;

    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);
    const { users } = game;

    const userIndex = users.findIndex((user) => user.userId === userId);

    if (userIndex === -1) throw new UserInputError('User not found');

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
