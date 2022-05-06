import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { GameService } from '../game.service';

@Injectable()
export class GqlGameGuard implements CanActivate {
  constructor(private gameService: GameService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { gameId: argsGameId } = ctx.getArgs();
    const { req, extra } = ctx.getContext();

    const user = extra ? extra.request.user : req.user;

    if (argsGameId !== user.gameId)
      throw new AuthenticationError(
        'You have no permission to access this game',
      );

    const game = await this.gameService.getGame(argsGameId);
    if (!game) throw new UserInputError('Game does not exist');

    if (game.deletedUsers.includes(user.userId))
      throw new AuthenticationError(
        'You have no permission to access this game',
      );

    return true;
  }
}
