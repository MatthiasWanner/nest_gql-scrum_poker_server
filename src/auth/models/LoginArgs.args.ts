import { ArgsType, Field } from '@nestjs/graphql';
import { UserRole } from 'src/user/models';

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
  @Field(() => UserRole, { description: 'User role' })
  readonly role: UserRole;
}
