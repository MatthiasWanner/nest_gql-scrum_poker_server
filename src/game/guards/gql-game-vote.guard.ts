import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { UserInSession } from 'src/user/models';
import { GameService } from '../game.service';
import { Status } from '../models';

@Injectable()
export class GqlGameVoteGuard implements CanActivate {
  constructor(private gameService: GameService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { gameId: argsGameId } = ctx.getArgs();
    const { req, extra } = ctx.getContext();

    const user: UserInSession = extra ? extra.request.user : req.user;

    const game = await this.gameService.getGame(argsGameId);
    if (!game) throw new UserInputError('Game does not exist');

    if (game.status !== Status.IN_PROGRESS)
      throw new ForbiddenError('Game is not in progress');

    const hasAlreadyVoted = game.users.find(
      (player) => player.userId === user.userId,
    )?.hasVoted;

    if (hasAlreadyVoted) throw new ForbiddenError('You have already voted');

    return true;
  }
}
