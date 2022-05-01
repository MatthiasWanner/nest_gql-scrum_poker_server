import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { GqlUserInfos } from 'src/common/decorators/gql-user-infos.decorator';
import { GqlAuthGuard } from './guards';
import { UserInSession } from '../user/models';

@Resolver('Auth')
export class AuthResolver {
  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserInSession, { nullable: false })
  me(@GqlUserInfos() user: UserInSession): UserInSession {
    return user;
  }
}
