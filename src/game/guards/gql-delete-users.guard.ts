import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';
import { Observable } from 'rxjs';
import { UpdateGameArgs } from '../models';

@Injectable()
export class GqlDeleteUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { input } = ctx.getArgs() as UpdateGameArgs;
    const { req, extra } = ctx.getContext();

    const user = (extra ? extra.request.user : req.user) as UserSession;

    if (input.deleteUsers && input.deleteUsers.includes(user.userId))
      throw new UserInputError('You can not delete yourself from the game');

    return true;
  }
}
