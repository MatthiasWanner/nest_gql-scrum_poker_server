import { ArgsType, Field } from '@nestjs/graphql';
import { UserRoles } from 'src/constants';

@ArgsType()
export class LoginArgs {
  @Field(() => String, { description: 'Id of existing user' })
  readonly userId: string;

  @Field(() => String, { description: 'Id of playing game' })
  readonly gameId: string;

  @Field(() => String, { description: 'Username send in body' })
  readonly username: string;

  /**
   * @description User role
   * @description This field will be deleted if database is implemented
   */
  @Field(() => String, { description: 'User role' })
  readonly role: UserRoles;
}
