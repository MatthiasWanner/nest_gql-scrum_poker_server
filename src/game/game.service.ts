import { Injectable } from '@nestjs/common';
import { UuidService } from 'src/auth/uuid.service';
import { AuthService } from 'src/auth/auth.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import {
  CreateGameInput,
  JoinGameInput,
  NewGame,
  UserJoinGame,
  CurrentGame,
  Status,
  PlayerVoteArgs,
} from './models';
import { User, UserInGame, UserRole } from 'src/user/models';
import { UserInputError } from 'apollo-server-express';
import { UpdateGameArgs } from './models/UpdateGame';

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

  async playerVote(userId: string, args: PlayerVoteArgs): Promise<CurrentGame> {
    const { gameId, input } = args;

    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);
    const { users } = game;

    const userIndex = users.findIndex((user) => user.userId === userId);

    if (userIndex === -1) throw new UserInputError('User not found');

    users[userIndex].vote = input.vote;
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

  async updateGame(args: UpdateGameArgs): Promise<CurrentGame> {
    const { gameId, input } = args;

    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);

    if (input.status) {
      switch (game.status) {
        case Status.FINISHED:
          throw new UserInputError('Game is already finished');

        case Status.IN_PROGRESS:
          if (input.status === Status.WAITING)
            throw new UserInputError('Game is already in progress');
          game.status = input.status;
          break;

        case Status.WAITING:
          if (input.status === Status.IN_PROGRESS && !(game.users.length > 1))
            throw new UserInputError('Game needs at least 2 players');
          game.status = input.status;
      }
    }
    input.gameName && (game.gameName = input.gameName);

    await this.cacheManager.set(`game_${gameId}`, game);

    return this.hidePlayersVotes(game);
  }

  async deleteUser(gameId: string, userId: string): Promise<CurrentGame> {
    const game = await this.cacheManager.get<CurrentGame>(`game_${gameId}`);

    const updatedGame = {
      ...game,
      users: game.users.filter((user) => user.userId !== userId),
    };
    await this.cacheManager.set(`game_${gameId}`, updatedGame);

    return updatedGame;
  }

  async quitGame(gameId: string, user: UserSession): Promise<CurrentGame> {
    if (user.role === UserRole.SCRUMMASTER)
      return this.updateGame({ gameId, input: { status: Status.FINISHED } });

    return this.deleteUser(gameId, user.userId);
  }
}
