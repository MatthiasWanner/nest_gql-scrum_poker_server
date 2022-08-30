import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserInSession, UserRole } from '@user/models';
import { LoginArgs, Login, JwtSession } from './models';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(args: LoginArgs): Login {
    return {
      ...args,
      accessToken: this.jwtService.sign(args),
    };
  }

  verifySessionToken(jwt: string): UserInSession {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, iat, ...userSession } =
      this.jwtService.verify<JwtSession>(jwt);
    return userSession;
  }

  checkRoles(authorizedRoles: UserRole[], userRole: UserRole): boolean {
    return authorizedRoles.includes(userRole);
  }

  parseCookies(cookieHeader: string) {
    return Object.fromEntries(
      cookieHeader.split('; ').map((cookie) => cookie.split('=')),
    );
  }
}
