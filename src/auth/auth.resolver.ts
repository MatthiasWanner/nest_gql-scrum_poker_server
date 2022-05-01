import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlUserInfos } from 'src/common/decorators/gql-user-infos.decorator';
import { GqlAuthGuard } from './guards';
import { UserInSession } from '../user/models';
import { Message } from 'src/models/app.models';
import { Response } from 'express';
import { accessTokenKey } from 'src/constants';

@Resolver('Auth')
export class AuthResolver {
  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserInSession, { nullable: false })
  me(@GqlUserInfos() user: UserInSession): UserInSession {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message, { nullable: false })
  logout(@Context('res') res: Response): Message {
    res.clearCookie(accessTokenKey);
    return { message: 'Logout successful' };
  }
}
