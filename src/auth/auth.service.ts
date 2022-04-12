import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginArgs, Login } from './models';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(args: LoginArgs): Login {
    return {
      ...args,
      accessToken: this.jwtService.sign(args),
    };
  }

  verifySessionToken(jwt: string): LoginArgs {
    return this.jwtService.verify<LoginArgs>(jwt);
  }

  checkRoles(authorizedRoles: string[], userRole: string): boolean {
    return authorizedRoles.includes(userRole);
  }
}
