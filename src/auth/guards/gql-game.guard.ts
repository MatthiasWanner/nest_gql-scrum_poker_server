import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-express';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class GqlGameGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const { gameId: argsGameId } = ctx.getArgs();
    const { req, extra } = ctx.getContext();

    const user = extra ? extra.request.user : req.user;

    if (argsGameId !== user.gameId)
      throw new AuthenticationError(
        'You have no permission to access this game',
      );

    return true;
  }
}
