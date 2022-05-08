import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { GameService } from '../game.service';
import { Status } from '../models';

@Injectable()
export class GqlGameJoinGuard implements CanActivate {
  constructor(private gameService: GameService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { gameId } = ctx.getArgs();
    const game = await this.gameService.getGame(gameId);

    if (!game) throw new UserInputError('Game does not exist');

    if (game.status === Status.IN_PROGRESS || game.status === Status.FINISHED)
      throw new ForbiddenError(
        `You can not join this game. It's ${game.status}`,
      );

    if (game.users.length >= game.maxPlayers)
      throw new ForbiddenError('Game is full');

    return true;
  }
}
