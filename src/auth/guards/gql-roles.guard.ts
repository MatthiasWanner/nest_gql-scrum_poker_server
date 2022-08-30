import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { ROLES_META } from '@common/decorators/roles.decorator';
import { UserRole } from '@user/models';
import { AuthService } from '@auth/auth.service';

@Injectable()
export class GqlRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<UserRole[]>(
      ROLES_META,
      context.getHandler(),
    );
    if (!roles) return true;

    const ctx = GqlExecutionContext.create(context);

    const { req } = ctx.getContext();

    if (!this.authService.checkRoles(roles, req.user.role))
      throw new Error('Acces denied for theses roles');

    return true;
  }
}
