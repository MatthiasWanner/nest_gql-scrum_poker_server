import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-express';
import { Observable } from 'rxjs';
import { accessTokenKey } from '@constants/index';
import { AuthService } from '@auth/auth.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req, extra } = ctx.getContext();

    // Queries and mutations context
    if (req) {
      const accessToken = req.cookies[accessTokenKey];
      if (!accessToken) throw new AuthenticationError('No access token');
      req.user = this.authService.verifySessionToken(accessToken);
    }

    // Subscriptions context
    if (extra) {
      const accessToken = this.authService.parseCookies(
        extra.request.headers.cookie,
      )[accessTokenKey];

      if (!accessToken) throw new AuthenticationError('No access token');
      extra.request.user = this.authService.verifySessionToken(accessToken);
    }
    return true;
  }
}
