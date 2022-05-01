import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

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
      const { accessToken } = req.cookies;
      if (!accessToken) throw new Error('No access token');
      req.user = this.authService.verifySessionToken(accessToken);
    }

    // Subscriptions context
    if (extra) {
      const { accessToken } = this.authService.parseCookies(
        extra.request.headers.cookie,
      );
      if (!accessToken) throw new Error('No access token');
      extra.request.user = this.authService.verifySessionToken(accessToken);
    }
    return true;
  }
}
